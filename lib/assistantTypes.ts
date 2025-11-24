export type Product = {
  id: string;
  name: string;
  price: number;
  gender: string;
  color: string;
  category: string;
  description: string;
  features: string[];
  url: string;
  tags: string[];
};

export type AssistantMode = "basic" | "advanced";
