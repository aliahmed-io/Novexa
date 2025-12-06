"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type ShippingFormProps = {
  initialAddress?: {
    name: string;
    street1: string;
    street2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string | null;
  } | null;
};

export function ShippingForm({ initialAddress }: ShippingFormProps) {
  const [form, setForm] = useState({
    shippingName: initialAddress?.name || "",
    shippingPhone: initialAddress?.phone || "",
    shippingStreet1: initialAddress?.street1 || "",
    shippingStreet2: initialAddress?.street2 || "",
    shippingCity: initialAddress?.city || "",
    shippingState: initialAddress?.state || "",
    shippingPostalCode: initialAddress?.postalCode || "",
    shippingCountry: initialAddress?.country || "US",
  });
  const [loading, setLoading] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [rates, setRates] = useState<any[]>([]);
  const [selectedRate, setSelectedRate] = useState<any>(null);
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(true);

  async function fetchRates() {
    if (!form.shippingStreet1 || !form.shippingCity || !form.shippingState || !form.shippingPostalCode || !form.shippingCountry) {
      // Don't fetch if address incomplete
      return;
    }

    setLoadingRates(true);
    setRates([]);
    setSelectedRate(null);

    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressTo: {
            name: form.shippingName || "Valued Customer",
            street1: form.shippingStreet1,
            city: form.shippingCity,
            state: form.shippingState,
            zip: form.shippingPostalCode,
            country: form.shippingCountry,
          }
        })
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setRates(data);
      }
    } catch (error) {
      console.error("Failed to load rates", error);
    } finally {
      setLoadingRates(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    if (rates.length > 0 && !selectedRate) {
      alert("Please select a shipping method");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        shippingRateId: selectedRate?.object_id,
        shippingCost: selectedRate?.amount,
        shippingServiceLevel: selectedRate?.provider,
        subscribeToNewsletter,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        console.error("Checkout failed", data);
        setLoading(false);
        return;
      }

      window.location.href = data.url as string;
    } catch (error) {
      console.error("Checkout error", error);
      setLoading(false);
    }
  }

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shippingName">Full name</Label>
          <Input
            id="shippingName"
            value={form.shippingName}
            onChange={(e) => updateField("shippingName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shippingPhone">Phone</Label>
          <Input
            id="shippingPhone"
            value={form.shippingPhone}
            onChange={(e) => updateField("shippingPhone", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shippingStreet1">Address line 1</Label>
        <Input
          id="shippingStreet1"
          value={form.shippingStreet1}
          onChange={(e) => updateField("shippingStreet1", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shippingStreet2">Address line 2 (optional)</Label>
        <Input
          id="shippingStreet2"
          value={form.shippingStreet2}
          onChange={(e) => updateField("shippingStreet2", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shippingCity">City</Label>
          <Input
            id="shippingCity"
            value={form.shippingCity}
            onChange={(e) => updateField("shippingCity", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shippingState">State / Region</Label>
          <Input
            id="shippingState"
            value={form.shippingState}
            onChange={(e) => updateField("shippingState", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shippingPostalCode">Postal code</Label>
          <Input
            id="shippingPostalCode"
            value={form.shippingPostalCode}
            onChange={(e) => updateField("shippingPostalCode", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2 max-w-xs">
        <Label htmlFor="shippingCountry">Country</Label>
        <Input
          id="shippingCountry"
          value={form.shippingCountry}
          onChange={(e) => updateField("shippingCountry", e.target.value)}
          required
        />
      </div>

      <div className="pt-4">
        <Button type="button" variant="secondary" onClick={fetchRates} disabled={loadingRates}>
          {loadingRates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Calculate Shipping
        </Button>

        {rates.length > 0 && (
          <div className="mt-4 space-y-3">
            <Label>Select Shipping Method</Label>
            <div className="grid gap-2">
              {rates.map((rate) => (
                <div key={rate.object_id} className={`flex items-center justify-between p-3 border rounded-md cursor-pointer ${selectedRate?.object_id === rate.object_id ? "border-primary bg-primary/5" : "border-input"}`}
                  onClick={() => setSelectedRate(rate)}>
                  <div className="flex items-center gap-2">
                    <input type="radio" checked={selectedRate?.object_id === rate.object_id} onChange={() => setSelectedRate(rate)} />
                    <span>{rate.provider} ({rate.servicelevel?.name})</span>
                  </div>
                  <span className="font-semibold">${rate.amount} {rate.currency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-start gap-2">
        <Checkbox
          id="subscribeToNewsletter"
          checked={subscribeToNewsletter}
          onCheckedChange={(checked) => setSubscribeToNewsletter(!!checked)}
        />
        <div className="space-y-1">
          <Label htmlFor="subscribeToNewsletter" className="font-medium">
            Email me product updates and special offers
          </Label>
          <p className="text-xs text-muted-foreground">
            You can unsubscribe at any time using the link in our emails.
          </p>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full mt-4" disabled={loading || (rates.length > 0 && !selectedRate)}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Redirecting to payment...
          </>
        ) : (
          "Continue to payment"
        )}
      </Button>
    </form>
  );
}
