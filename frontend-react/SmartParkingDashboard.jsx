import React, { useState, useEffect, useRef } from "react";
import { CarFront, LogIn, LogOut, RotateCcw, Activity, AlertTriangle, Wifi, WifiOff } from "lucide-react";

export default function SmartParkingDashboard() {
  const MAX_CAPACITY = 10;

  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("available");
  const [logs, setLogs] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [sensorConnected, setSensorConnected] = useState(true);

  const prevCountRef = useRef(0);
  const supabaseUrl = "https://czggojwcsasptljblzfe.supabase.co/rest/v1/parking?id=eq.1";
  const apiKey = "sb_publishable_M8_LLmMGaeCzsXOzUFar-w_aDPgMrXo";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(supabaseUrl, {
          headers: { apikey: apiKey }
        });
        const data = await res.json();

        if (data && data.length > 0) {
          const newCount = data[0].count;
          const newStatus = data[0].status;

          setStatus(newStatus || (newCount >= MAX_CAPACITY ? "Parking Full" : "available"));

          if (newCount !== prevCountRef.current) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            let actionLog = "";
            if (newCount > prevCountRef.current) {
              actionLog = `Car entered: ${newCount}`;
            } else if (newCount < prevCountRef.current) {
              actionLog = `Car exited: ${newCount}`;
            }

            setLogs(prev => {
              const newLogs = actionLog ? [{ action: actionLog, time }, ...prev].slice(0, 5) : prev;
              if (newCount >= MAX_CAPACITY && prevCountRef.current < MAX_CAPACITY) {
                return [{ action: "Parking Full", time }, ...newLogs].slice(0, 5);
              }
              return newLogs;
            });

            setCount(newCount);
            prevCountRef.current = newCount;
          }
        }
      } catch (err) {
        console.error("Error fetching data from Supabase:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1500);

    return () => clearInterval(interval);
  }, []);

  const available = MAX_CAPACITY - count;
  const isFull = count >= MAX_CAPACITY;
  const isEmpty = count === 0;

  const updateSupabase = async (newCount) => {
    const newStatus = newCount >= MAX_CAPACITY ? "Parking Full" : "available";
    try {
      await fetch(supabaseUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          count: newCount,
          status: newStatus
        })
      });
      setCount(newCount);
      setStatus(newStatus);
      prevCountRef.current = newCount;
    } catch (err) {
      console.error("Failed to update Supabase", err);
    }
  };

  const handleEntry = () => {
    if (count < MAX_CAPACITY) {
      const newCount = count + 1;
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLogs(prev => [{ action: `Car entered: ${newCount}`, time }, ...prev].slice(0, 5));
      if (newCount >= MAX_CAPACITY) {
        setLogs(prev => [{ action: "Parking Full", time }, ...prev].slice(0, 5));
      }
      updateSupabase(newCount);
    }
  };

  const handleExit = () => {
    if (count > 0) {
      const newCount = count - 1;
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLogs(prev => [{ action: `Car exited: ${newCount}`, time }, ...prev].slice(0, 5));
      updateSupabase(newCount);
    }
  };

  const confirmReset = async () => {
    try {
      await fetch(supabaseUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          count: 0,
          status: "available"
        })
      });

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLogs([{ action: "System Reset", time }]);

      setCount(0);
      setStatus("available");
      prevCountRef.current = 0;
      setShowResetConfirm(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <CarFront className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Smart Parking</h1>
            <p className="text-xs text-slate-400">Commercial Access Network</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/40">
          <Wifi className="w-4 h-4" />
          <span>Sensor Online</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live Occupancy Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-300">Live Occupancy</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isFull ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              {isFull ? "PARKING FULL" : "AVAILABLE"}
            </span>
          </div>

          <div className="flex items-baseline gap-4 my-6">
            <span className="text-6xl font-extrabold text-white">{available}</span>
            <span className="text-2xl text-slate-500 font-medium">/ {MAX_CAPACITY}</span>
            <div className="ml-auto text-right">
              <span className="text-xs uppercase text-slate-400 tracking-wider">Occupied</span>
              <p className="text-3xl font-bold text-slate-200">{count}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${isFull ? "bg-red-500" : "bg-emerald-500"}`}
              style={{ width: `${(count / MAX_CAPACITY) * 100}%` }}
            />
          </div>
        </div>

        {/* Manual Controls Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Manual Controls
          </h2>

          <div className="flex gap-4">
            <button
              onClick={handleEntry}
              disabled={isFull}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition"
            >
              <LogIn className="w-5 h-5 text-emerald-400" />
              Car Entered
            </button>
            <button
              onClick={handleExit}
              disabled={isEmpty}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition"
            >
              <LogOut className="w-5 h-5 text-rose-400" />
              Car Exited
            </button>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="mt-4 flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 text-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reset System
          </button>
        </div>

        {/* Recent Activity Log */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold text-slate-300 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-slate-500 text-sm">No activity recorded yet.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {log.action}
                  </span>
                  <span className="text-xs text-slate-500">{log.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* IoT Integration Status */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-300 mb-2">IoT Sensor Integration</h2>
            <p className="text-xs text-slate-400 mb-4">
              Simulate an external hardware sensor triggering an entry. Connect/disconnect to test fault tolerance.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setSensorConnected(!sensorConnected)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold py-2 px-3 rounded-lg border border-slate-700 transition"
            >
              {sensorConnected ? "Disconnect Sensor" : "Connect Sensor"}
            </button>
            <button
              onClick={handleEntry}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold py-2 px-3 rounded-lg transition"
            >
              Trigger Entry Beam
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Reset Parking Counter?</h3>
            <p className="text-sm text-slate-400 mb-6">This will reset total vehicles to 0.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-semibold text-sm transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
