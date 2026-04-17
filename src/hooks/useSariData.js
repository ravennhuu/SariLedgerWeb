import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

function processNotes(raw) {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') {
    return Object.values(raw).filter(Boolean).join(' · ');
  }
  return String(raw);
}

function toDate(ts) {
  if (!ts) return null;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts instanceof Date) return ts;
  return null;
}

export function useSariData() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ready = { items: false, customers: false, transactions: false };
    const markReady = () => {
      if (ready.items && ready.customers && ready.transactions) setLoading(false);
    };

    const unsubItems = onSnapshot(
      collection(db, 'items'),
      (snap) => {
        setItems(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: data.name ?? 'Unknown',
              buyingPrice: data.buyingPrice ?? 0,
              sellingPrice: data.sellingPrice ?? 0,
              stockCount: data.stockCount ?? 0,
            };
          })
        );
        ready.items = true;
        markReady();
      },
      (err) => { console.error('[useSariData] items error:', err); setError(err); }
    );

    const unsubCustomers = onSnapshot(
      collection(db, 'customers'),
      (snap) => {
        setCustomers(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: data.name ?? 'Unknown',
              contact: data.contact ?? '',
              totalDebt: data.totalDebt ?? 0,
              notes: processNotes(data.notes),
            };
          })
        );
        ready.customers = true;
        markReady();
      },
      (err) => { console.error('[useSariData] customers error:', err); setError(err); }
    );

    const unsubTransactions = onSnapshot(
      collection(db, 'transactions'),
      (snap) => {
        setTransactions(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              customerId: data.customerId ?? '',
              itemId: data.itemId ?? '',
              quantity: data.quantity ?? 1,
              manualPriceOverride: data.manualPriceOverride ?? 0,
              date: toDate(data.date),
              isPaid: data.isPaid ?? false,
              paidDate: toDate(data.paidDate),
            };
          })
        );
        ready.transactions = true;
        markReady();
      },
      (err) => { console.error('[useSariData] transactions error:', err); setError(err); }
    );

    return () => {
      unsubItems();
      unsubCustomers();
      unsubTransactions();
    };
  }, []);

  return { items, customers, transactions, loading, error };
}
