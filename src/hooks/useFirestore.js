import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function useFirestore() {
  const [inventory, setInventory] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ready = { inventory: false, ledger: false };

    const markReady = () => {
      if (ready.inventory && ready.ledger) setLoading(false);
    };

    const unsubInventory = onSnapshot(
      collection(db, 'inventory'),
      (snap) => {
        const docs = snap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name ?? 'Unknown',
          price: doc.data().price ?? 0,
          stock: doc.data().stock ?? 0,
          lowStockThreshold: doc.data().lowStockThreshold ?? 5,
        }));
        setInventory(docs);
        ready.inventory = true;
        markReady();
      },
      (err) => {
        console.error('[useFirestore] inventory error:', err);
        setError(err);
      }
    );

    const unsubLedger = onSnapshot(
      collection(db, 'ledger'),
      (snap) => {
        const docs = snap.docs.map((doc) => ({
          id: doc.id,
          description: doc.data().description ?? '',
          amount: doc.data().amount ?? 0,
          status: doc.data().status ?? 'pending',
          createdAt: doc.data().createdAt?.toDate() ?? new Date(0),
          customerName: doc.data().customerName ?? null,
        }));
        setLedger(docs);
        ready.ledger = true;
        markReady();
      },
      (err) => {
        console.error('[useFirestore] ledger error:', err);
        setError(err);
      }
    );

    return () => {
      unsubInventory();
      unsubLedger();
    };
  }, []);

  return { inventory, ledger, loading, error };
}
