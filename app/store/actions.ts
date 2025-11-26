"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { redis } from "@/lib/redis";
import { Cart } from "@/lib/interfaces";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

import prisma from "@/lib/db";
import { bannerSchema, productSchema } from "@/lib/zodSchemas";

async function enrichProductWithVision(productId: string, imageUrl: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelId = process.env.GEMINI_MODEL;

  if (!apiKey || !modelId) {
    return;
  }

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return;

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });

    const prompt = `You are a shoe vision tagger. Look at this shoe image and respond with STRICT JSON only, no extra text:
{
  "color": "...",
  "style": "...",
  "height": "...",
  "pattern": "...",
  "tags": ["..."],
  "features": ["..."]
}

- "height": one of ["low-top", "mid-top", "high-top"]
- "pattern": like ["solid", "striped", "multicolor"]
- "style": e.g. "running", "basketball", "sneaker", "boot", "formal"
- "tags": short visual descriptors only (no full sentences).`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64,
              },
            },
          ],
        },
      ],
    });

    const text = result.response.text().trim();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return;
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        color: parsed.color ?? "",
        style: parsed.style ?? "",
        height: parsed.height ?? "",
        pattern: parsed.pattern ?? "",
        tags: parsed.tags ?? [],
        features: parsed.features ?? [],
      },
    });
  } catch (error) {
    console.error("Failed to enrich product with vision", error);
  }
}

export async function createProduct(prevState: unknown, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alihassan182006@gmail.com") {
    return redirect("/store/shop");
  }

  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const flattenUrls = submission.value.images.flatMap((urlString) =>
    urlString.split(",").map((url) => url.trim())
  );

  const created = await prisma.product.create({
    data: {
      name: submission.value.name,
      description: submission.value.description,
      status: submission.value.status,
      price: submission.value.price,
      images: flattenUrls,
      category: submission.value.category,
      isFeatured: submission.value.isFeatured === true ? true : false,
    },
  });

  if (flattenUrls.length > 0) {
    void enrichProductWithVision(created.id, flattenUrls[0]);
  }

  redirect("/store/dashboard/products");
}

export async function editProduct(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alihassan182006@gmail.com") {
    return redirect("/store/shop");
  }

  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const flattenUrls = submission.value.images.flatMap((urlString) =>
    urlString.split(",").map((url) => url.trim())
  );

  const productId = formData.get("productId") as string;
  const updated = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      name: submission.value.name,
      description: submission.value.description,
      category: submission.value.category,
      price: submission.value.price,
      isFeatured: submission.value.isFeatured === true ? true : false,
      status: submission.value.status,
      images: flattenUrls,
    },
  });

  if (flattenUrls.length > 0) {
    void enrichProductWithVision(updated.id, flattenUrls[0]);
  }

  redirect("/store/dashboard/products");
}

export async function deleteProduct(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alihassan182006@gmail.com") {
    return redirect("/store/shop");
  }

  await prisma.product.delete({
    where: {
      id: formData.get("productId") as string,
    },
  });

  redirect("/store/dashboard/products");
}

export async function createBanner(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alihassan182006@gmail.com") {
    return redirect("/store/shop");
  }

  const submission = parseWithZod(formData, {
    schema: bannerSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const urls = submission.value.imageString
    .split(",")
    .map((u: string) => u.trim())
    .filter((u: string) => u.length > 0);

  if (urls.length === 0) {
    return submission.reply();
  }

  await prisma.banner.createMany({
    data: urls.map((url: string) => ({
      title: submission.value.title,
      imageString: url,
    })),
  });

  redirect("/store/dashboard/banner");
}

export async function deleteBanner(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alihassan182006@gmail.com") {
    return redirect("/store/shop");
  }

  await prisma.banner.delete({
    where: {
      id: formData.get("bannerId") as string,
    },
  });

  redirect("/store/dashboard/banner");
}

export async function addItem(productId: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/store/shop");
  }

  let cart: Cart | null = null;
  if (redis) {
    cart = (await redis.get<Cart>(`cart-${user.id}`)) as Cart | null;
  }

  const selectedProduct = await prisma.product.findUnique({
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
    },
    where: {
      id: productId,
    },
  });

  if (!selectedProduct) {
    throw new Error("No product with this id");
  }
  let myCart = {} as Cart;

  if (!cart || !cart.items) {
    myCart = {
      userId: user.id,
      items: [
        {
          price: selectedProduct.price,
          id: selectedProduct.id,
          imageString: selectedProduct.images[0],
          name: selectedProduct.name,
          quantity: 1,
        },
      ],
    };
  } else {
    let itemFound = false;

    myCart.items = cart.items.map((item) => {
      if (item.id === productId) {
        itemFound = true;
        item.quantity += 1;
      }

      return item;
    });

    if (!itemFound) {
      myCart.items.push({
        id: selectedProduct.id,
        imageString: selectedProduct.images[0],
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1,
      });
    }
  }

  if (redis) {
    await redis.set(`cart-${user.id}`, myCart);
  }

  revalidatePath("/store", "layout");
}

export async function delItem(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/store/shop");
  }

  const productId = formData.get("productId");

  const cart: Cart | null = redis
    ? ((await redis.get<Cart>(`cart-${user.id}`)) as Cart | null)
    : null;

  if (cart && cart.items) {
    const updateCart: Cart = {
      userId: user.id,
      items: cart.items.filter((item) => item.id !== productId),
    };

    if (redis) {
      await redis.set(`cart-${user.id}`, updateCart);
    }
  }

  revalidatePath("/store/bag");
}

export async function checkOut() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/store/shop");
  }

  const cart: Cart | null = redis
    ? ((await redis.get<Cart>(`cart-${user.id}`)) as Cart | null)
    : null;

}