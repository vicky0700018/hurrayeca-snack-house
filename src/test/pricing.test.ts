import { describe, expect, it } from "vitest";
import { computeTotals, couponError } from "@/lib/pricing";
import type { CartItem, Coupon } from "@/lib/types";

const item = (unitPrice: number, qty = 1): CartItem => ({ key: `k${unitPrice}`, productId: "p", weight: "400g", unitPrice, unitMrp: unitPrice + 20, qty });
const welcome: Coupon = { id: "c1", code: "WELCOME10", description: "", type: "percent", value: 10, minOrder: 299, expiry: "2027-12-31", active: true };
const swad: Coupon = { id: "c2", code: "SWAD150", description: "", type: "flat", value: 150, minOrder: 999, expiry: "2027-06-30", active: true };
const opts = { freeDeliveryThreshold: 499, deliveryCharge: 49, today: "2026-11-23" };

describe("delivery charge", () => {
  it("charges ₹49 below ₹499", () => {
    expect(computeTotals([item(300)], opts).delivery).toBe(49);
  });
  it("is free at ₹499 or more", () => {
    expect(computeTotals([item(499)], opts).delivery).toBe(0);
  });
  it("is free for an empty cart", () => {
    expect(computeTotals([], opts).delivery).toBe(0);
  });
});

describe("coupons", () => {
  it("WELCOME10 takes 10% off orders of ₹299+", () => {
    const t = computeTotals([item(500)], { ...opts, coupon: welcome });
    expect(t.couponDiscount).toBe(50);
    expect(t.total).toBe(450);
  });
  it("rejects a coupon below its minimum order", () => {
    expect(couponError(swad, 998, opts.today)).toMatch(/999/);
    expect(computeTotals([item(998)], { ...opts, coupon: swad }).couponDiscount).toBe(0);
  });
  it("rejects an expired coupon", () => {
    expect(couponError({ ...welcome, expiry: "2026-11-01" }, 1000, opts.today)).toBe("This coupon has expired");
  });
  it("rejects an inactive coupon", () => {
    expect(couponError({ ...welcome, active: false }, 1000, opts.today)).toBe("This coupon is not active");
  });
  it("flat discount never exceeds the subtotal", () => {
    expect(computeTotals([item(100)], { ...opts, coupon: { ...swad, minOrder: 0 } }).couponDiscount).toBe(100);
  });
});
