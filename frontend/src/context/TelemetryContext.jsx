import React, { createContext, useContext, useState, useCallback } from 'react';

const TelemetryContext = createContext();

export const TelemetryProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    successCount: 0,
    rejectedCount: 0,
    activeQueue: 0,
    pendingPayments: [], // { id, ref, amount, productId, status, timestamp }
    stockRemaining: {
      'void-hoodie': 12,
      'vortex-kb': 8
    },
    rps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  });

  const pushEvent = useCallback((event) => {
    setEvents(prev => [
      { id: Date.now(), timestamp: new Date().toLocaleTimeString(), ...event },
      ...prev.slice(0, 49)
    ]);

    setMetrics(prev => {
      const newMetrics = { ...prev };
      if (event.type === 'CHECKOUT_START') {
        newMetrics.totalRequests += 1;
        newMetrics.activeQueue += 1;
        const newRps = [...prev.rps];
        newRps[newRps.length - 1] += 1;
        newMetrics.rps = newRps;
      }
      if (event.type === 'RESERVE_STOCK') {
        newMetrics.activeQueue -= 1;
        if (event.productId) {
          newMetrics.stockRemaining[event.productId] = Math.max(0, newMetrics.stockRemaining[event.productId] - 1);
        }
        newMetrics.pendingPayments.push({
          id: event.orderId,
          ref: event.ref,
          productId: event.productId,
          amount: event.amount,
          status: 'PENDING',
          timestamp: new Date().toLocaleTimeString()
        });
      }
      if (event.type === 'PAYMENT_VERIFIED') {
        newMetrics.successCount += 1;
        newMetrics.pendingPayments = newMetrics.pendingPayments.map(p => 
          p.id === event.orderId ? { ...p, status: 'VERIFIED' } : p
        );
      }
      if (event.type === 'PAYMENT_REJECTED') {
        newMetrics.rejectedCount += 1;
        const rejected = newMetrics.pendingPayments.find(p => p.id === event.orderId);
        if (rejected && rejected.productId) {
          newMetrics.stockRemaining[rejected.productId] += 1; // Return to pool
        }
        newMetrics.pendingPayments = newMetrics.pendingPayments.filter(p => p.id !== event.orderId);
      }
      return newMetrics;
    });
  }, []);

  const resetMetrics = useCallback(() => {
    setMetrics({
      totalRequests: 0,
      successCount: 0,
      rejectedCount: 0,
      activeQueue: 0,
      stockRemaining: {
        'void-hoodie': 12,
        'vortex-kb': 8
      },
      rps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    });
    setEvents([]);
  }, []);

  return (
    <TelemetryContext.Provider value={{ events, metrics, pushEvent, resetMetrics }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => useContext(TelemetryContext);
