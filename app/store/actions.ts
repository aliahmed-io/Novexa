"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { redis } from "@/lib/redis";
import { Cart } from "@/lib/interfaces";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

import prisma from "@/lib/db";
import { bannerSchema, productSchema, reviewSchema } from "@/lib/zodSchemas";
import { Stripe } from "stripe";
import { ProductStatus } from "@prisma/client";
import { containsBadLanguage } from "@/lib/filterBadWords";
import { logAudit } from "@/lib/audit";

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
      categoryId: submission.value.category,
      mainCategory: submission.value.mainCategory,
      isFeatured: submission.value.isFeatured === true ? true : false,
      discountPercentage: submission.value.discountPercentage,
    },
  },
  });

await logAudit({
  userId: user.id,
  action: "CREATE",
  targetType: "PRODUCT",
  targetId: created.id,
  metadata: { name: created.name },
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
      categoryId: submission.value.category,
      mainCategory: submission.value.mainCategory,
      price: submission.value.price,
      isFeatured: submission.value.isFeatured === true ? true : false,
      status: submission.value.status,
      images: flattenUrls,
      discountPercentage: submission.value.discountPercentage,
    },
  },
  });

await logAudit({
  userId: user.id,
  action: "UPDATE",
  targetType: "PRODUCT",
  targetId: updated.id,
  metadata: { name: updated.name },
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

  await logAudit({
    userId: user.id,
    action: "DELETE",
    targetType: "PRODUCT",
    targetId: formData.get("productId") as string,
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
      discountPercentage: true,
    },
    where: {
      id: productId,
    },
  });

  if (!selectedProduct) {
    throw new Error("No product with this id");
  }
  let myCart = {} as Cart;

  const price = selectedProduct.discountPercentage > 0
    ? Math.round(selectedProduct.price * (1 - selectedProduct.discountPercentage / 100))
    : selectedProduct.price;

  if (!cart || !cart.items) {
    myCart = {
      userId: user.id,
      items: [
        {
          price: price,
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
        price: price,
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
      items: cart.items.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }
        return item;
      }).filter((item) => item.quantity > 0),
      discountCode: cart.discountCode,
      discountPercentage: cart.discountPercentage,
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

export async function applyDiscount(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/store/shop");
  }

  const code = formData.get("code") as string;

  const discount = await prisma.discount.findUnique({
    where: {
      code: code,
      isActive: true,
    },
  });

  if (!discount) {
    return { error: "Invalid or expired discount code" };
  }

  if ((discount as any).expiresAt && (discount as any).expiresAt < new Date()) {
    return { error: "Discount code has expired" };
  }

  const cart: Cart | null = redis
    ? ((await redis.get<Cart>(`cart-${user.id}`)) as Cart | null)
    : null;

  if (cart && redis) {
    const updateCart: Cart = {
      ...cart,
      discountCode: discount.code,
      discountPercentage: discount.percentage,
    };
    await redis.set(`cart-${user.id}`, updateCart);
  }

  revalidatePath("/store/bag");
}

export async function removeDiscount() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/store/shop");
  }

  const cart: Cart | null = redis
    ? ((await redis.get<Cart>(`cart-${user.id}`)) as Cart | null)
    : null;

  if (cart && redis) {
    const { discountCode, discountPercentage, ...rest } = cart;
    const updateCart: Cart = {
      ...rest,
      // Explicitly remove them if they are optional in the interface, 
      // or set to undefined/null if that's how the interface is defined.
      // Based on usage, they seem optional.
    };
    // Actually, to be safe, let's just reconstruct without them
    await redis.set(`cart-${user.id}`, updateCart);
  }

  revalidatePath("/store/bag");
}

export async function createReview(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/store/api/auth/login");
  }

  const submission = parseWithZod(formData, {
    schema: reviewSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  if (containsBadLanguage(submission.value.comment)) {
    return submission.reply({
      fieldErrors: {
        comment: ["Please maintain professional language. Your comment contains inappropriate words."],
      },
    });
  }

  const productId = formData.get("productId") as string;

  await prisma.review.create({
    data: {
      rating: submission.value.rating,
      comment: submission.value.comment,
      userId: user.id,
      productId: productId,
    },
  });

  const reviews = await prisma.review.findMany({
    where: {
      productId: productId,
    },
    select: {
      rating: true,
    },
  });

  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      averageRating: averageRating,
      reviewCount: reviews.length,
    },
  });

  revalidatePath(`/store/product/${productId}`);
}

export async function bulkUpdateProducts(updates: { id: string; name?: string; status?: ProductStatus; price?: number }[]) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alihassan182006@gmail.com") {
    throw new Error("Unauthorized");
  }

  for (const update of updates) {
    await prisma.product.update({
      where: { id: update.id },
      data: {
        name: update.name,
        status: update.status,
        price: update.price,
      },
    });
  }
  revalidatePath("/store/dashboard/products");
}

export async function bulkDeleteProducts(ids: string[]) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alihassan182006@gmail.com") {
    throw new Error("Unauthorized");
  }

  await prisma.product.deleteMany({
    where: {
      id: { in: ids },
    },
  });
  revalidatePath("/store/dashboard/products");
}

import { createMeshyTask } from "@/lib/meshy";

export async function generate3DModel(productId: string, imageUrl: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alihassan182006@gmail.com") {
    throw new Error("Unauthorized");
  }

  try {
    const task = await createMeshyTask(imageUrl);

    await prisma.product.update({
      where: { id: productId },
      data: {
        meshyTaskId: task.result, // Meshy returns task ID in 'result' field for v2
        meshyStatus: "PENDING",
        meshyProgress: 0,
      },
    });

    revalidatePath(`/store/dashboard/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to start 3D generation:", error);
    return { success: false, error: "Failed to start generation" };
  }
}

export async function delete3DModel(productId: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alihassan182006@gmail.com") {
    throw new Error("Unauthorized");
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      modelUrl: null,
      meshyTaskId: null,
      meshyStatus: null,
      meshyProgress: null,
    },
  });

  revalidatePath(`/store/dashboard/products/${productId}`);
  revalidatePath(`/store/product/${productId}`);
}

export async function checkMeshyStatus(productId: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) return null;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      meshyStatus: true,
      meshyProgress: true,
      modelUrl: true,
    },
  });

  return {
    status: product?.meshyStatus,
    progress: product?.meshyProgress,
    modelUrl: product?.modelUrl,
  };
}