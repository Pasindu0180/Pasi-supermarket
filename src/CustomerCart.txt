import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot
} from "firebase/firestore";

import { db } from "./firebase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export const CustomerCart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [status, setStatus] = useState("shopping");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cartRef = doc(db, "cart", "current");

    const unsubscribeCart = onSnapshot(
      cartRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          setTotal(data.total || 0);
          setItemCount(data.itemCount || 0);
          setStatus(data.status || "shopping");
        }

        setLoading(false);
      },
      (error) => {
        console.error("Cart Firebase error:", error);
        setLoading(false);
      }
    );

    const itemsRef = collection(
      db,
      "cart",
      "current",
      "items"
    );

    const unsubscribeItems = onSnapshot(
      itemsRef,
      (snapshot) => {
        const newItems: CartItem[] = [];

        snapshot.forEach((itemDoc) => {
          const data = itemDoc.data();

          newItems.push({
            id: itemDoc.id,
            name: data.name || "Unknown Item",
            price: Number(data.price || 0),
            quantity: Number(data.quantity || 1)
          });
        });

        setItems(newItems);
      },
      (error) => {
        console.error("Items Firebase error:", error);
      }
    );

    return () => {
      unsubscribeCart();
      unsubscribeItems();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 30, textAlign: "center" }}>
        Loading your cart...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "0 auto",
        padding: 20,
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1 style={{ textAlign: "center" }}>
        PASI SUPERMARKET
      </h1>

      <p style={{ textAlign: "center" }}>
        Smart RFID Mobile Cart
      </p>

      <div
        style={{
          marginTop: 20,
          padding: 15,
          border: "1px solid #ddd",
          borderRadius: 10
        }}
      >
        <strong>Status:</strong> {status}
      </div>

      <h2 style={{ marginTop: 25 }}>
        Your Cart ({itemCount} items)
      </h2>

      {items.length === 0 ? (
        <div
          style={{
            padding: 30,
            textAlign: "center",
            border: "1px solid #ddd",
            borderRadius: 10
          }}
        >
          Your cart is empty.
          <br />
          Scan a product using the RFID reader.
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 15,
              marginBottom: 12
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: "bold"
              }}
            >
              {item.name}
            </div>

            <div style={{ marginTop: 8 }}>
              Price: Rs. {item.price}
            </div>

            <div>
              Quantity: {item.quantity}
            </div>

            <div style={{ marginTop: 8 }}>
              Subtotal: Rs.{" "}
              {item.price * item.quantity}
            </div>
          </div>
        ))
      )}

      <div
        style={{
          marginTop: 25,
          padding: 20,
          border: "2px solid #222",
          borderRadius: 10
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: "bold"
          }}
        >
          TOTAL: Rs. {total}
        </div>
      </div>

      <button
        style={{
          width: "100%",
          padding: 16,
          marginTop: 20,
          fontSize: 18,
          fontWeight: "bold",
          border: "none",
          borderRadius: 10,
          cursor: "pointer"
        }}
      >
        CHECKOUT
      </button>
    </div>
  );
};