import { useEffect, useState } from "react";
import api from "../../Api/axios";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIMEZONES = [
  { label: "India (IST) UTC+5:30", value: "Asia/Kolkata" },
  { label: "London (GMT) UTC+0", value: "Europe/London" },
  { label: "New York (EST) UTC-5", value: "America/New_York" },
  { label: "Dubai (GST) UTC+4", value: "Asia/Dubai" },
  { label: "Singapore (SGT) UTC+8", value: "Asia/Singapore" },
  { label: "Tokyo (JST) UTC+9", value: "Asia/Tokyo" },
  { label: "Sydney (AEST) UTC+10", value: "Australia/Sydney" },
];

function TimezoneSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label
        style={{
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "#64748b",
          display: "block",
          marginBottom: "6px",
        }}
      >
        🌍 Your Timezone
      </label>
      <select
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          fontSize: "0.9rem",
          width: "100%",
          outline: "none",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Availability() {
  const [recurring, setRecurring] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"recurring" | "block">("recurring");

  const [recurringForm, setRecurringForm] = useState({
    dayOfWeek: "1",
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: "30",
    timezone: "Asia/Kolkata",
  });

  const [blockForm, setBlockForm] = useState({
    blockDate: "",
    blockReason: "",
    timezone: "Asia/Kolkata",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await api.get("/availability/me");
      setRecurring(res.data.data.recurring);
      setBlocks(res.data.data.blocks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const showMsg = (msg: string, isError = false) => {
    isError ? setError(msg) : setSuccess(msg);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  const addRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/availability/recurring", {
        dayOfWeek: Number(recurringForm.dayOfWeek),
        startTime: recurringForm.startTime,
        endTime: recurringForm.endTime,
        slotDuration: Number(recurringForm.slotDuration),
      });
      showMsg("Recurring slot added!");
      fetchAvailability();
    } catch (err: any) {
      showMsg(err.response?.data?.message || "Failed", true);
    } finally {
      setSaving(false);
    }
  };

  const addBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/availability/block", blockForm);
      showMsg("Date blocked!");
      setBlockForm({
        blockDate: "",
        blockReason: "",
        timezone: blockForm.timezone,
      });
      fetchAvailability();
    } catch (err: any) {
      showMsg(err.response?.data?.message || "Failed", true);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecurring = async (id: string) => {
    try {
      await api.delete(`/availability/recurring/${id}`);
      showMsg("Slot removed");
      fetchAvailability();
    } catch (err: any) {
      showMsg(err.response?.data?.message || "Failed", true);
    }
  };

  const deleteBlock = async (id: string) => {
    try {
      await api.delete(`/availability/block/${id}`);
      showMsg("Block removed");
      fetchAvailability();
    } catch (err: any) {
      showMsg(err.response?.data?.message || "Failed", true);
    }
  };

  const card = {
    background: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    marginBottom: "1.5rem",
  };

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "0.9rem",
    width: "100%",
    outline: "none",
  };

  const btnPrimary = {
    padding: "10px 24px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg,#2563eb,#06b6d4)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 800, color: "#1e293b" }}>
            Manage Availability
          </h2>
          <p style={{ color: "#64748b" }}>
            Set your weekly schedule and block dates
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "1rem",
              fontWeight: 600,
            }}
          >
            ❌ {error}
          </div>
        )}
        {success && (
          <div
            style={{
              background: "#d1fae5",
              color: "#065f46",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "1rem",
              fontWeight: 600,
            }}
          >
            ✅ {success}
          </div>
        )}

        <div className="row g-4">
          {/* Left — Forms */}
          <div className="col-md-5">
            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
              {(["recurring", "block"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    background:
                      tab === t
                        ? "linear-gradient(135deg,#2563eb,#06b6d4)"
                        : "#e2e8f0",
                    color: tab === t ? "white" : "#64748b",
                  }}
                >
                  {t === "recurring" ? "🗓 Weekly Schedule" : "🚫 Block Date"}
                </button>
              ))}
            </div>

            {/* Recurring Form */}
            {tab === "recurring" && (
              <div style={card}>
                <h6
                  style={{
                    fontWeight: 700,
                    marginBottom: "1rem",
                    color: "#1e293b",
                  }}
                >
                  Add Weekly Slot
                </h6>
                <form onSubmit={addRecurring}>
                  <div style={{ marginBottom: "12px" }}>
                    <label
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#64748b",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      Day of Week
                    </label>
                    <select
                      style={inputStyle}
                      value={recurringForm.dayOfWeek}
                      onChange={(e) =>
                        setRecurringForm({
                          ...recurringForm,
                          dayOfWeek: e.target.value,
                        })
                      }
                    >
                      {DAYS.map((d, i) => (
                        <option key={i} value={i}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#64748b",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        Start Time
                      </label>
                      <input
                        type="time"
                        style={inputStyle}
                        value={recurringForm.startTime}
                        onChange={(e) =>
                          setRecurringForm({
                            ...recurringForm,
                            startTime: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#64748b",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        End Time
                      </label>
                      <input
                        type="time"
                        style={inputStyle}
                        value={recurringForm.endTime}
                        onChange={(e) =>
                          setRecurringForm({
                            ...recurringForm,
                            endTime: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#64748b",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      Slot Duration (minutes)
                    </label>
                    <select
                      style={inputStyle}
                      value={recurringForm.slotDuration}
                      onChange={(e) =>
                        setRecurringForm({
                          ...recurringForm,
                          slotDuration: e.target.value,
                        })
                      }
                    >
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                    </select>
                  </div>
                  <TimezoneSelect
                    value={recurringForm.timezone}
                    onChange={(val) =>
                      setRecurringForm({ ...recurringForm, timezone: val })
                    }
                  />

                  <button type="submit" disabled={saving} style={btnPrimary}>
                    {saving ? "Adding..." : "➕ Add Slot"}
                  </button>
                </form>
              </div>
            )}

            {/* Block Form */}
            {tab === "block" && (
              <div style={card}>
                <h6
                  style={{
                    fontWeight: 700,
                    marginBottom: "1rem",
                    color: "#1e293b",
                  }}
                >
                  Block a Date
                </h6>
                <form onSubmit={addBlock}>
                  <div style={{ marginBottom: "12px" }}>
                    <label
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#64748b",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      Date to Block
                    </label>
                    <input
                      type="date"
                      style={inputStyle}
                      value={blockForm.blockDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setBlockForm({
                          ...blockForm,
                          blockDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#64748b",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      Reason (optional)
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      placeholder="e.g. Leave, Holiday, Personal"
                      value={blockForm.blockReason}
                      onChange={(e) =>
                        setBlockForm({
                          ...blockForm,
                          blockReason: e.target.value,
                        })
                      }
                    />
                  </div>

                  <TimezoneSelect
                    value={blockForm.timezone}
                    onChange={(val) =>
                      setBlockForm({ ...blockForm, timezone: val })
                    }
                  />

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      ...btnPrimary,
                      background: "linear-gradient(135deg,#ef4444,#dc2626)",
                    }}
                  >
                    {saving ? "Blocking..." : "🚫 Block Date"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right — Current Schedule */}
          <div className="col-md-7">
            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <div className="spinner-border text-primary" />
              </div>
            ) : (
              <>
                {/* Weekly Schedule */}
                <div style={card}>
                  <h6
                    style={{
                      fontWeight: 700,
                      marginBottom: "1rem",
                      color: "#1e293b",
                    }}
                  >
                    🗓 Weekly Schedule
                  </h6>
                  {recurring.length === 0 ? (
                    <p
                      style={{
                        color: "#64748b",
                        textAlign: "center",
                        padding: "1rem",
                      }}
                    >
                      No recurring slots added yet
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {recurring.map((slot) => (
                        <div
                          key={slot._id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#f8fafc",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: "#2563eb" }}>
                              {DAYS[slot.dayOfWeek]}
                            </span>
                            <span
                              style={{
                                color: "#64748b",
                                marginLeft: "10px",
                                fontSize: "0.9rem",
                              }}
                            >
                              {slot.startTime} – {slot.endTime}
                            </span>
                            <span
                              style={{
                                marginLeft: "8px",
                                background: "#eff6ff",
                                color: "#2563eb",
                                fontSize: "0.75rem",
                                padding: "2px 8px",
                                borderRadius: "20px",
                                fontWeight: 600,
                              }}
                            >
                              {slot.slotDuration} min
                            </span>
                            {/* ✅ show timezone */}
                            <div
                              style={{
                                color: "#94a3b8",
                                fontSize: "0.78rem",
                                marginTop: "3px",
                              }}
                            >
                              🌍 {slot.timezone || "Asia/Kolkata"}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteRecurring(slot._id)}
                            style={{
                              background: "#fee2e2",
                              color: "#ef4444",
                              border: "none",
                              borderRadius: "8px",
                              padding: "4px 10px",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Blocked Dates */}
                <div style={card}>
                  <h6
                    style={{
                      fontWeight: 700,
                      marginBottom: "1rem",
                      color: "#1e293b",
                    }}
                  >
                    🚫 Blocked Dates
                  </h6>
                  {blocks.length === 0 ? (
                    <p
                      style={{
                        color: "#64748b",
                        textAlign: "center",
                        padding: "1rem",
                      }}
                    >
                      No blocked dates
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {blocks.map((block) => (
                        <div
                          key={block._id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#fff7f7",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            border: "1px solid #fecaca",
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: "#ef4444" }}>
                              {new Date(block.blockDate).toLocaleDateString(
                                "en-IN",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                            {block.blockReason && (
                              <span
                                style={{
                                  color: "#64748b",
                                  marginLeft: "10px",
                                  fontSize: "0.85rem",
                                }}
                              >
                                — {block.blockReason}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteBlock(block._id)}
                            style={{
                              background: "#fee2e2",
                              color: "#ef4444",
                              border: "none",
                              borderRadius: "8px",
                              padding: "4px 10px",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
