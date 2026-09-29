import { useEffect, useMemo, useState } from "react";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";

import {
  Activity,
  Bell,
  CheckCircle,
  Droplets,
  Gauge,
  Leaf,
  LogOut,
  Plus,
  Settings,
  Sprout,
  Thermometer,
  Trash2,
  User,
  Waves,
  Wifi,
  Wind,
  X,
  Zap
} from "lucide-react";

import { auth, db } from "./firebase";
import "./App.css";

const PLANT_THRESHOLDS = {
  tomato: 40,
  herb: 35,
  succulent: 20,
  indoor: 30
};

const INITIAL_SENSOR = {
  soilMoisture: 45,
  temperature: 27,
  humidity: 65,
  lightLevel: 72,
  waterTank: 85,
  pump: false,
  deviceOnline: true
};

function App() {
  /* =========================
     AUTH
  ========================= */

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);

  /* =========================
     NAVIGATION
     ========================= */

  const [activeSection, setActiveSection] =
    useState("dashboard");

  /* =========================
     PLANTS
  ========================= */

  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] =
    useState(null);

  const [plantName, setPlantName] = useState("");
  const [plantType, setPlantType] =
    useState("tomato");
  const [moistureThreshold, setMoistureThreshold] =
    useState(40);

  const [showAddPlant, setShowAddPlant] =
    useState(false);

  /* =========================
     SENSOR
  ========================= */

  const [sensor, setSensor] =
    useState(INITIAL_SENSOR);

  const [sensorHistory, setSensorHistory] =
    useState([]);

  const [wateringHistory, setWateringHistory] =
    useState([]);

  /* =========================
     SETTINGS
  ========================= */

  const [autoWatering, setAutoWatering] =
    useState(true);

  const [simulator, setSimulator] =
    useState(true);

  /* =========================
     UI
  ========================= */

  const [loading, setLoading] = useState(false);
  const [watering, setWatering] = useState(false);
  const [message, setMessage] = useState("");

  /* =========================
     AUTH LISTENER
  ========================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);

        if (currentUser) {
          await createUserProfile(currentUser);
          await loadPlants(currentUser.uid);
        } else {
          setPlants([]);
          setSelectedPlant(null);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================
     FIREBASE USER PROFILE
  ========================= */

  async function createUserProfile(currentUser) {
    try {
      const userRef = doc(
        db,
        "users",
        currentUser.uid
      );

      await setDoc(
        userRef,
        {
          email: currentUser.email,
          lastLogin: serverTimestamp()
        },
        {
          merge: true
        }
      );
    } catch (error) {
      console.error(
        "PROFILE ERROR:",
        error
      );
    }
  }

  /* =========================
     LOAD PLANTS
  ========================= */

  async function loadPlants(uid) {
    try {
      const plantsRef = collection(
        db,
        "users",
        uid,
        "plants"
      );

      const snapshot =
        await getDocs(plantsRef);

      const plantList =
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));

      setPlants(plantList);

      if (plantList.length > 0) {
        setSelectedPlant(
          plantList[0]
        );
      } else {
        setSelectedPlant(null);
      }
    } catch (error) {
      console.error(
        "LOAD PLANTS ERROR:",
        error
      );

      setMessage(
        "Unable to load plants. Check Firestore permissions."
      );
    }
  }

  /* =========================
     FIRESTORE SENSOR LISTENER
  ========================= */

  useEffect(() => {
    if (!user) return;

    const readingsRef = collection(
      db,
      "users",
      user.uid,
      "sensorReadings"
    );

    const readingsQuery = query(
      readingsRef,
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      readingsQuery,
      (snapshot) => {
        const readings =
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
          }));

        if (readings.length > 0) {
          const latest = readings[0];

          setSensor({
            soilMoisture:
              Number(
                latest.soilMoisture ?? 45
              ),
            temperature:
              Number(
                latest.temperature ?? 27
              ),
            humidity:
              Number(
                latest.humidity ?? 65
              ),
            lightLevel:
              Number(
                latest.lightLevel ?? 72
              ),
            waterTank:
              Number(
                latest.waterTank ?? 85
              ),
            pump:
              Boolean(
                latest.pump ?? false
              ),
            deviceOnline:
              true
          });

          setSensorHistory(
            [...readings].reverse()
          );
        }
      },
      (error) => {
        console.error(
          "SENSOR LISTENER ERROR:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [user]);

  /* =========================
     FIRESTORE WATERING HISTORY
  ========================= */

  useEffect(() => {
    if (!user) return;

    const historyRef =
      collection(
        db,
        "users",
        user.uid,
        "wateringHistory"
      );

    const historyQuery = query(
      historyRef,
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const unsubscribe =
      onSnapshot(
        historyQuery,
        (snapshot) => {
          const history =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data()
              })
            );

          setWateringHistory(
            history
          );
        },
        (error) => {
          console.error(
            "WATERING HISTORY ERROR:",
            error
          );
        }
      );

    return () => unsubscribe();
  }, [user]);

  /* =========================
     VIRTUAL IOT SIMULATOR
  ========================= */

  useEffect(() => {
    if (!user || !simulator) {
      return;
    }

    let currentMoisture =
      sensor.soilMoisture;

    const interval =
      setInterval(async () => {
        try {
          let newMoisture =
            currentMoisture;

          if (!sensor.pump) {
            newMoisture =
              Math.max(
                5,
                newMoisture -
                  Math.random() * 3
              );
          } else {
            newMoisture =
              Math.min(
                100,
                newMoisture +
                  Math.random() * 8
              );
          }

          currentMoisture =
            newMoisture;

          const newTemperature =
            24 +
            Math.random() * 8;

          const newHumidity =
            55 +
            Math.random() * 25;

          const newLight =
            45 +
            Math.random() * 50;

          const newTank =
            sensor.pump
              ? Math.max(
                  0,
                  sensor.waterTank - 1
                )
              : sensor.waterTank;

          await addDoc(
            collection(
              db,
              "users",
              user.uid,
              "sensorReadings"
            ),
            {
              soilMoisture:
                Number(
                  newMoisture.toFixed(1)
                ),
              temperature:
                Number(
                  newTemperature.toFixed(1)
                ),
              humidity:
                Number(
                  newHumidity.toFixed(1)
                ),
              lightLevel:
                Number(
                  newLight.toFixed(1)
                ),
              waterTank:
                Number(
                  newTank.toFixed(1)
                ),
              pump: sensor.pump,
              createdAt:
                serverTimestamp()
            }
          );
        } catch (error) {
          console.error(
            "SIMULATOR ERROR:",
            error
          );
        }
      }, 8000);

    return () =>
      clearInterval(interval);
  }, [
    user,
    simulator,
    sensor.pump,
    sensor.waterTank
  ]);

  /* =========================
     AUTOMATIC WATERING
  ========================= */

  useEffect(() => {
    if (
      !user ||
      !selectedPlant ||
      !autoWatering ||
      watering
    ) {
      return;
    }

    if (
      sensor.soilMoisture <
        Number(
          selectedPlant.moistureThreshold
        ) &&
      sensor.waterTank > 10
    ) {
      automaticWatering();
    }
  }, [
    sensor.soilMoisture,
    selectedPlant,
    autoWatering
  ]);

  async function automaticWatering() {
    if (!user || !selectedPlant) {
      return;
    }

    try {
      setWatering(true);

      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "wateringHistory"
        ),
        {
          plantId:
            selectedPlant.id,
          plantName:
            selectedPlant.name,
          type: "Automatic",
          moistureBefore:
            sensor.soilMoisture,
          createdAt:
            serverTimestamp()
        }
      );

      setSensor(
        (previous) => ({
          ...previous,
          pump: true
        })
      );

      setMessage(
        "Automatic watering started."
      );

      setTimeout(() => {
        setSensor(
          (previous) => ({
            ...previous,
            pump: false,
            soilMoisture:
              Math.min(
                100,
                previous.soilMoisture +
                  15
              )
          })
        );

        setMessage(
          "Automatic watering completed."
        );

        setWatering(false);
      }, 5000);
    } catch (error) {
      console.error(
        "AUTO WATER ERROR:",
        error
      );

      setWatering(false);
    }
  }

  /* =========================
     MANUAL WATERING
  ========================= */

  async function manualWater() {
    if (!user || !selectedPlant) {
      setMessage(
        "Please select a plant first."
      );
      return;
    }

    if (sensor.waterTank <= 10) {
      setMessage(
        "Water tank is too low."
      );
      return;
    }

    if (watering) {
      return;
    }

    try {
      setWatering(true);

      setSensor(
        (previous) => ({
          ...previous,
          pump: true
        })
      );

      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "wateringHistory"
        ),
        {
          plantId:
            selectedPlant.id,
          plantName:
            selectedPlant.name,
          type: "Manual",
          moistureBefore:
            sensor.soilMoisture,
          createdAt:
            serverTimestamp()
        }
      );

      setMessage(
        "Manual watering started."
      );

      setTimeout(() => {
        setSensor(
          (previous) => ({
            ...previous,
            pump: false,
            soilMoisture:
              Math.min(
                100,
                previous.soilMoisture +
                  18
              ),
            waterTank:
              Math.max(
                0,
                previous.waterTank - 2
              )
          })
        );

        setMessage(
          "Plant watered successfully."
        );

        setWatering(false);
      }, 5000);
    } catch (error) {
      console.error(
        "MANUAL WATER ERROR:",
        error
      );

      setWatering(false);
      setMessage(
        error.message
      );
    }
  }

  /* =========================
     AUTH
  ========================= */

  async function handleAuth(event) {
    event.preventDefault();

    setMessage("");

    if (!email || !password) {
      setMessage(
        "Please enter your email and password."
      );
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      if (mode === "register") {
        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        await createUserProfile(
          result.user
        );
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }
    } catch (error) {
      console.error(error);

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        setMessage(
          "This email is already registered."
        );
      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        setMessage(
          "Please enter a valid email."
        );
      } else if (
        error.code ===
        "auth/invalid-credential"
      ) {
        setMessage(
          "Incorrect email or password."
        );
      } else {
        setMessage(
          error.message
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     ADD PLANT
  ========================= */

  async function addPlant(event) {
    event.preventDefault();

    if (!plantName.trim()) {
      setMessage(
        "Please enter a plant name."
      );
      return;
    }

    if (!user) {
      setMessage(
        "Please login first."
      );
      return;
    }

    try {
      setLoading(true);

      const plantData = {
        name: plantName.trim(),
        plantType,
        moistureThreshold:
          Number(moistureThreshold),
        createdAt:
          serverTimestamp()
      };

      const plantsRef =
        collection(
          db,
          "users",
          user.uid,
          "plants"
        );

      const result =
        await addDoc(
          plantsRef,
          plantData
        );

      const newPlant = {
        id: result.id,
        name: plantName.trim(),
        plantType,
        moistureThreshold:
          Number(moistureThreshold)
      };

      setPlants(
        (previous) => [
          ...previous,
          newPlant
        ]
      );

      setSelectedPlant(
        newPlant
      );

      setPlantName("");
      setPlantType("tomato");
      setMoistureThreshold(40);

      setShowAddPlant(false);

      setMessage(
        "Plant added successfully."
      );
    } catch (error) {
      console.error(
        "ADD PLANT ERROR:",
        error
      );

      setMessage(
        error.message
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     DELETE PLANT
  ========================= */

  async function deletePlant(plant) {
    if (!user || !plant) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${plant.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "users",
          user.uid,
          "plants",
          plant.id
        )
      );

      const updatedPlants =
        plants.filter(
          (item) =>
            item.id !== plant.id
        );

      setPlants(
        updatedPlants
      );

      if (
        selectedPlant?.id ===
        plant.id
      ) {
        setSelectedPlant(
          updatedPlants[0] ||
            null
        );
      }

      setMessage(
        "Plant deleted successfully."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error.message
      );
    }
  }

  /* =========================
     LOGOUT
  ========================= */

  async function logout() {
    await signOut(auth);
  }

  /* =========================
     ALERTS
  ========================= */

  const alerts = useMemo(() => {
    const list = [];

    if (
      selectedPlant &&
      sensor.soilMoisture <
        selectedPlant.moistureThreshold
    ) {
      list.push({
        level: "WARNING",
        title: "Low Soil Moisture",
        text: `${selectedPlant.name} is below its configured moisture threshold.`
      });
    }

    if (sensor.waterTank <= 20) {
      list.push({
        level: "CRITICAL",
        title: "Low Water Tank",
        text: "The water tank level is below 20%."
      });
    }

    if (sensor.temperature >= 35) {
      list.push({
        level: "WARNING",
        title: "High Temperature",
        text: "Plant temperature is above the recommended range."
      });
    }

    if (!sensor.deviceOnline) {
      list.push({
        level: "CRITICAL",
        title: "Device Offline",
        text: "No recent sensor data has been received."
      });
    }

    if (list.length === 0) {
      list.push({
        level: "INFO",
        title: "All Systems Healthy",
        text: "No active plant-care alerts."
      });
    }

    return list;
  }, [
    selectedPlant,
    sensor
  ]);

  /* =========================
     ANALYTICS
  ========================= */

  const averageMoisture =
    sensorHistory.length
      ? (
          sensorHistory.reduce(
            (sum, item) =>
              sum +
              Number(
                item.soilMoisture ||
                  0
              ),
            0
          ) /
          sensorHistory.length
        ).toFixed(1)
      : sensor.soilMoisture;

  const averageTemperature =
    sensorHistory.length
      ? (
          sensorHistory.reduce(
            (sum, item) =>
              sum +
              Number(
                item.temperature ||
                  0
              ),
            0
          ) /
          sensorHistory.length
        ).toFixed(1)
      : sensor.temperature;

  /* =========================
     AUTH SCREEN
  ========================= */

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="brand-icon">
              <Sprout size={30} />
            </div>

            <span>SmartPlant</span>
          </div>

          <div className="auth-content">
            <span className="eyebrow">
              CLOUD + IoT PLATFORM
            </span>

            <h1>
              Smarter care for
              <span>
                healthier plants.
              </span>
            </h1>

            <p>
              Monitor your plants,
              track environmental
              conditions and
              automate watering from
              one cloud-connected
              dashboard.
            </p>

            <div className="feature-list">
              <div>
                <CheckCircle size={20} />
                Real-time plant monitoring
              </div>

              <div>
                <CheckCircle size={20} />
                Intelligent watering automation
              </div>

              <div>
                <CheckCircle size={20} />
                Cloud-based sensor history
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="mobile-logo">
              <Sprout size={30} />
            </div>

            <h2>
              {mode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p className="auth-description">
              {mode === "login"
                ? "Sign in to your plant dashboard."
                : "Start monitoring your plants in the cloud."}
            </p>

            <div className="auth-tabs">
              <button
                className={
                  mode === "login"
                    ? "auth-tab active"
                    : "auth-tab"
                }
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
              >
                Login
              </button>

              <button
                className={
                  mode === "register"
                    ? "auth-tab active"
                    : "auth-tab"
                }
                onClick={() => {
                  setMode("register");
                  setMessage("");
                }}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuth}>
              <label>
                Email address
              </label>

              <input
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
              />

              <label>
                Password
              </label>

              <input
                type="password"
                value={password}
                placeholder="Minimum 6 characters"
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
              />

              <button
                className="main-button"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Sign in"
                  : "Create account"}
              </button>
            </form>

            {message && (
              <div className="message">
                {message}
              </div>
            )}

            <div className="auth-footer">
              Secured by Firebase Authentication
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     DASHBOARD APP
  ========================= */

  return (
    <div className="app">
      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Sprout size={23} />
          </div>

          <div>
            <strong>
              SmartPlant
            </strong>

            <small>
              Cloud IoT
            </small>
          </div>
        </div>

        <nav>
          <SidebarButton
            icon={<Gauge size={19} />}
            text="Dashboard"
            active={
              activeSection ===
              "dashboard"
            }
            onClick={() =>
              setActiveSection(
                "dashboard"
              )
            }
          />

          <SidebarButton
            icon={<Leaf size={19} />}
            text="My Plants"
            active={
              activeSection ===
              "plants"
            }
            onClick={() =>
              setActiveSection(
                "plants"
              )
            }
          />

          <SidebarButton
            icon={<Activity size={19} />}
            text="Analytics"
            active={
              activeSection ===
              "analytics"
            }
            onClick={() =>
              setActiveSection(
                "analytics"
              )
            }
          />

          <SidebarButton
            icon={<Bell size={19} />}
            text="Alerts"
            active={
              activeSection ===
              "alerts"
            }
            badge={
              alerts.filter(
                (item) =>
                  item.level !==
                  "INFO"
              ).length
            }
            onClick={() =>
              setActiveSection(
                "alerts"
              )
            }
          />

          <SidebarButton
            icon={<Settings size={19} />}
            text="Settings"
            active={
              activeSection ===
              "settings"
            }
            onClick={() =>
              setActiveSection(
                "settings"
              )
            }
          />
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              <User size={17} />
            </div>

            <div>
              <strong>
                {user.email?.split(
                  "@"
                )[0]}
              </strong>

              <small>
                Plant Owner
              </small>
            </div>
          </div>

          <button
            className="logout-side"
            onClick={logout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              SmartPlant /{" "}
              {getSectionTitle(
                activeSection
              )}
            </div>

            <h1>
              {getSectionTitle(
                activeSection
              )}
            </h1>
          </div>

          <div className="top-actions">
            <div className="connection-status">
              <span></span>
              Firebase Connected
            </div>

            <button
              className="icon-button"
              onClick={() =>
                setActiveSection(
                  "alerts"
                )
              }
            >
              <Bell size={20} />

              {alerts.some(
                (item) =>
                  item.level !==
                  "INFO"
              ) && (
                <span className="bell-dot"></span>
              )}
            </button>
          </div>
        </header>

        {/* ================= DASHBOARD ================= */}

        {activeSection ===
          "dashboard" && (
          <DashboardSection
            user={user}
            plants={plants}
            selectedPlant={
              selectedPlant
            }
            sensor={sensor}
            autoWatering={
              autoWatering
            }
            watering={watering}
            setShowAddPlant={
              setShowAddPlant
            }
            setActiveSection={
              setActiveSection
            }
            manualWater={
              manualWater
            }
            alerts={alerts}
            message={message}
          />
        )}

        {/* ================= PLANTS ================= */}

        {activeSection ===
          "plants" && (
          <PlantsSection
            plants={plants}
            selectedPlant={
              selectedPlant
            }
            setSelectedPlant={
              setSelectedPlant
            }
            setShowAddPlant={
              setShowAddPlant
            }
            deletePlant={
              deletePlant
            }
            sensor={sensor}
            manualWater={
              manualWater
            }
            watering={watering}
          />
        )}

        {/* ================= ANALYTICS ================= */}

        {activeSection ===
          "analytics" && (
          <AnalyticsSection
            sensor={sensor}
            sensorHistory={
              sensorHistory
            }
            wateringHistory={
              wateringHistory
            }
            averageMoisture={
              averageMoisture
            }
            averageTemperature={
              averageTemperature
            }
          />
        )}

        {/* ================= ALERTS ================= */}

        {activeSection ===
          "alerts" && (
          <AlertsSection
            alerts={alerts}
            sensor={sensor}
            selectedPlant={
              selectedPlant
            }
          />
        )}

        {/* ================= SETTINGS ================= */}

        {activeSection ===
          "settings" && (
          <SettingsSection
            autoWatering={
              autoWatering
            }
            setAutoWatering={
              setAutoWatering
            }
            simulator={
              simulator
            }
            setSimulator={
              setSimulator
            }
            sensor={sensor}
            user={user}
          />
        )}
      </main>

      {/* ================= ADD PLANT MODAL ================= */}

      {showAddPlant && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <span className="panel-label">
                  PLANT MANAGEMENT
                </span>

                <h2>
                  Add New Plant
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setShowAddPlant(false)
                }
              >
                <X size={21} />
              </button>
            </div>

            <form
              onSubmit={addPlant}
            >
              <label>
                Plant Name
              </label>

              <input
                value={plantName}
                placeholder="Example: My Tomato"
                onChange={(e) =>
                  setPlantName(
                    e.target.value
                  )
                }
              />

              <label>
                Plant Type
              </label>

              <select
                value={plantType}
                onChange={(e) => {
                  const value =
                    e.target.value;

                  setPlantType(
                    value
                  );

                  setMoistureThreshold(
                    PLANT_THRESHOLDS[
                      value
                    ]
                  );
                }}
              >
                <option value="tomato">
                  Tomato
                </option>

                <option value="herb">
                  Herb
                </option>

                <option value="succulent">
                  Succulent
                </option>

                <option value="indoor">
                  Indoor Plant
                </option>
              </select>

              <label>
                Moisture Threshold (%)
              </label>

              <input
                type="number"
                min="1"
                max="100"
                value={
                  moistureThreshold
                }
                onChange={(e) =>
                  setMoistureThreshold(
                    e.target.value
                  )
                }
              />

              <button
                className="main-button"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save Plant"}
              </button>
            </form>

            {message && (
              <div className="message">
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   SIDEBAR BUTTON
===================================================== */

function SidebarButton({
  icon,
  text,
  active,
  badge,
  onClick
}) {
  return (
    <button
      className={
        active
          ? "nav-item active"
          : "nav-item"
      }
      onClick={onClick}
    >
      {icon}

      <span>{text}</span>

      {badge > 0 && (
        <span className="notification-dot">
          {badge}
        </span>
      )}
    </button>
  );
}

/* =====================================================
   DASHBOARD
===================================================== */

function DashboardSection({
  user,
  plants,
  selectedPlant,
  sensor,
  autoWatering,
  watering,
  setShowAddPlant,
  setActiveSection,
  manualWater,
  alerts,
  message
}) {
  const needsWater =
    selectedPlant &&
    sensor.soilMoisture <
      selectedPlant.moistureThreshold;

  return (
    <>
      <section className="welcome-row">
        <div>
          <h2>
            Good to see you,{" "}
            {user.email?.split(
              "@"
            )[0]} 👋
          </h2>

          <p>
            Here's what's happening
            with your plants today.
          </p>
        </div>

        <button
          className="add-button"
          onClick={() =>
            setShowAddPlant(true)
          }
        >
          <Plus size={19} />
          Add Plant
        </button>
      </section>

      {message && (
        <div className="success-message">
          <CheckCircle size={18} />
          {message}
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          icon={<Leaf />}
          title="Total Plants"
          value={plants.length}
          unit="plants"
        />

        <StatCard
          icon={<Droplets />}
          title="Soil Moisture"
          value={sensor.soilMoisture}
          unit="%"
          warning={needsWater}
        />

        <StatCard
          icon={<Thermometer />}
          title="Temperature"
          value={sensor.temperature}
          unit="°C"
        />

        <StatCard
          icon={<Wind />}
          title="Humidity"
          value={sensor.humidity}
          unit="%"
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                SELECTED PLANT
              </span>

              <h3>
                {selectedPlant
                  ? selectedPlant.name
                  : "No plant selected"}
              </h3>
            </div>

            {selectedPlant && (
              <div
                className={
                  needsWater
                    ? "status warning"
                    : "status healthy"
                }
              >
                <span></span>

                {needsWater
                  ? "Needs Water"
                  : "Healthy"}
              </div>
            )}
          </div>

          {selectedPlant ? (
            <>
              <div className="plant-visual">
                <div className="plant-circle">
                  <Sprout size={60} />
                </div>

                <div>
                  <strong>
                    {capitalize(
                      selectedPlant.plantType
                    )}
                  </strong>

                  <p>
                    Moisture threshold:{" "}
                    {
                      selectedPlant.moistureThreshold
                    }
                    %
                  </p>
                </div>
              </div>

              <div className="moisture-section">
                <div className="progress-title">
                  <span>
                    Soil Moisture
                  </span>

                  <strong>
                    {
                      sensor.soilMoisture
                    }
                    %
                  </strong>
                </div>

                <div className="progress-bar">
                  <div
                    className={
                      needsWater
                        ? "progress-fill danger"
                        : "progress-fill"
                    }
                    style={{
                      width: `${Math.min(
                        100,
                        sensor.soilMoisture
                      )}%`
                    }}
                  ></div>
                </div>

                <div className="threshold-text">
                  Target threshold:{" "}
                  {
                    selectedPlant.moistureThreshold
                  }
                  %
                </div>
              </div>

              <button
                className="water-button"
                onClick={manualWater}
                disabled={watering}
              >
                <Droplets size={20} />

                {watering
                  ? "Watering..."
                  : "Water Plant"}
              </button>
            </>
          ) : (
            <EmptyPlants
              setShowAddPlant={
                setShowAddPlant
              }
            />
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                SYSTEM
              </span>

              <h3>
                Device Status
              </h3>
            </div>

            <Wifi
              size={21}
              className="online-icon"
            />
          </div>

          <div className="system-list">
            <SystemRow
              icon={<Wifi />}
              label="Device"
              value={
                sensor.deviceOnline
                  ? "Online"
                  : "Offline"
              }
              online={
                sensor.deviceOnline
              }
            />

            <SystemRow
              icon={<Droplets />}
              label="Pump"
              value={
                sensor.pump
                  ? "ON"
                  : "OFF"
              }
              online={
                !sensor.pump
              }
            />

            <SystemRow
              icon={<Zap />}
              label="Auto Watering"
              value={
                autoWatering
                  ? "Enabled"
                  : "Disabled"
              }
              online={
                autoWatering
              }
            />

            <SystemRow
              icon={<Waves />}
              label="Water Tank"
              value={`${sensor.waterTank}%`}
              online={
                sensor.waterTank >
                20
              }
            />
          </div>

          <div className="tank-container">
            <div className="progress-title">
              <span>
                Water Tank
              </span>

              <strong>
                {sensor.waterTank}%
              </strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${sensor.waterTank}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel chart-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              SENSOR ANALYTICS
            </span>

            <h3>
              Live Sensor Overview
            </h3>
          </div>

          <button
            className="small-button"
            onClick={() =>
              setActiveSection(
                "analytics"
              )
            }
          >
            View Analytics
          </button>
        </div>

        <div className="mini-metrics">
          <MiniMetric
            title="Light"
            value={`${sensor.lightLevel}%`}
            icon={<Zap />}
          />

          <MiniMetric
            title="Temperature"
            value={`${sensor.temperature}°C`}
            icon={<Thermometer />}
          />

          <MiniMetric
            title="Humidity"
            value={`${sensor.humidity}%`}
            icon={<Wind />}
          />

          <MiniMetric
            title="Tank"
            value={`${sensor.waterTank}%`}
            icon={<Waves />}
          />
        </div>
      </section>

      <section className="alert-panel">
        <div className="alert-icon">
          <Bell size={20} />
        </div>

        <div>
          <strong>
            {alerts[0].title}
          </strong>

          <p>
            {alerts[0].text}
          </p>
        </div>

        <span className="alert-time">
          Current
        </span>
      </section>
    </>
  );
}

/* =====================================================
   MY PLANTS
===================================================== */

function PlantsSection({
  plants,
  selectedPlant,
  setSelectedPlant,
  setShowAddPlant,
  deletePlant,
  sensor,
  manualWater,
  watering
}) {
  return (
    <>
      <section className="section-intro">
        <div>
          <span className="eyebrow">
            PLANT MANAGEMENT
          </span>

          <h2>
            My Plants
          </h2>

          <p>
            Manage your plants and
            their individual moisture
            thresholds.
          </p>
        </div>

        <button
          className="add-button"
          onClick={() =>
            setShowAddPlant(true)
          }
        >
          <Plus size={19} />
          Add Plant
        </button>
      </section>

      {plants.length === 0 ? (
        <div className="large-empty">
          <Sprout size={60} />

          <h2>
            No plants added yet
          </h2>

          <p>
            Add your first plant to
            start cloud monitoring.
          </p>

          <button
            className="add-button"
            onClick={() =>
              setShowAddPlant(true)
            }
          >
            <Plus size={19} />
            Add Your First Plant
          </button>
        </div>
      ) : (
        <div className="plants-grid">
          {plants.map((plant) => {
            const selected =
              selectedPlant?.id ===
              plant.id;

            const needsWater =
              selected &&
              sensor.soilMoisture <
                plant.moistureThreshold;

            return (
              <div
                className={
                  selected
                    ? "plant-card selected"
                    : "plant-card"
                }
                key={plant.id}
                onClick={() =>
                  setSelectedPlant(
                    plant
                  )
                }
              >
                <div className="plant-card-top">
                  <div className="plant-card-icon">
                    <Sprout size={28} />
                  </div>

                  <button
                    className="delete-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      deletePlant(
                        plant
                      );
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <h3>
                  {plant.name}
                </h3>

                <span className="plant-type">
                  {capitalize(
                    plant.plantType
                  )}
                </span>

                <div className="plant-card-info">
                  <div>
                    <span>
                      Moisture
                    </span>

                    <strong>
                      {selected
                        ? `${sensor.soilMoisture}%`
                        : "--"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Threshold
                    </span>

                    <strong>
                      {
                        plant.moistureThreshold
                      }
                      %
                    </strong>
                  </div>
                </div>

                <div
                  className={
                    selected
                      ? needsWater
                        ? "plant-status warning"
                        : "plant-status"
                      : "plant-status neutral"
                  }
                >
                  {selected
                    ? needsWater
                      ? "Needs Water"
                      : "Healthy"
                    : "Click to Monitor"}
                </div>

                {selected && (
                  <button
                    className="water-button small"
                    onClick={(event) => {
                      event.stopPropagation();
                      manualWater();
                    }}
                    disabled={watering}
                  >
                    <Droplets size={17} />

                    {watering
                      ? "Watering..."
                      : "Water Plant"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* =====================================================
   ANALYTICS
===================================================== */

function AnalyticsSection({
  sensor,
  sensorHistory,
  wateringHistory,
  averageMoisture,
  averageTemperature
}) {
  return (
    <>
      <section className="section-intro">
        <div>
          <span className="eyebrow">
            CLOUD ANALYTICS
          </span>

          <h2>
            Analytics
          </h2>

          <p>
            Historical sensor readings
            and watering activity.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          icon={<Droplets />}
          title="Current Moisture"
          value={sensor.soilMoisture}
          unit="%"
        />

        <StatCard
          icon={<Activity />}
          title="Average Moisture"
          value={averageMoisture}
          unit="%"
        />

        <StatCard
          icon={<Thermometer />}
          title="Average Temperature"
          value={averageTemperature}
          unit="°C"
        />

        <StatCard
          icon={<Droplets />}
          title="Watering Events"
          value={
            wateringHistory.length
          }
          unit="events"
        />
      </section>

      <div className="analytics-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                HISTORICAL DATA
              </span>

              <h3>
                Soil Moisture
              </h3>
            </div>

            <Droplets size={21} />
          </div>

          <SensorChart
            data={sensorHistory}
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                RECENT EVENTS
              </span>

              <h3>
                Watering History
              </h3>
            </div>
          </div>

          {wateringHistory.length ===
          0 ? (
            <div className="empty-small">
              <Droplets size={32} />

              <p>
                No watering events yet.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {wateringHistory
                .slice(0, 8)
                .map((item) => (
                  <div
                    className="history-row"
                    key={item.id}
                  >
                    <div className="history-icon">
                      <Droplets size={17} />
                    </div>

                    <div>
                      <strong>
                        {item.plantName ||
                          "Plant"}
                      </strong>

                      <span>
                        {item.type ||
                          "Watering"}{" "}
                        watering
                      </span>
                    </div>

                    <small>
                      {formatTimestamp(
                        item.createdAt
                      )}
                    </small>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* =====================================================
   ALERTS
===================================================== */

function AlertsSection({
  alerts,
  sensor,
  selectedPlant
}) {
  return (
    <>
      <section className="section-intro">
        <div>
          <span className="eyebrow">
            MONITORING
          </span>

          <h2>
            Alerts
          </h2>

          <p>
            Current conditions requiring
            attention.
          </p>
        </div>

        <div className="alert-summary">
          {alerts.filter(
            (item) =>
              item.level !== "INFO"
          ).length}{" "}
          active
        </div>
      </section>

      <div className="alerts-list">
        {alerts.map(
          (alert, index) => (
            <div
              className={
                alert.level ===
                "CRITICAL"
                  ? "full-alert critical"
                  : alert.level ===
                    "WARNING"
                  ? "full-alert warning"
                  : "full-alert info"
              }
              key={`${alert.title}-${index}`}
            >
              <div className="full-alert-icon">
                <Bell size={22} />
              </div>

              <div>
                <div className="alert-heading">
                  <strong>
                    {alert.title}
                  </strong>

                  <span>
                    {alert.level}
                  </span>
                </div>

                <p>
                  {alert.text}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                CURRENT CONDITIONS
              </span>

              <h3>
                Plant Monitoring
              </h3>
            </div>
          </div>

          <div className="condition-list">
            <Condition
              label="Soil Moisture"
              value={`${sensor.soilMoisture}%`}
              status={
                selectedPlant &&
                sensor.soilMoisture <
                  selectedPlant.moistureThreshold
                  ? "Attention"
                  : "Normal"
              }
            />

            <Condition
              label="Temperature"
              value={`${sensor.temperature}°C`}
              status={
                sensor.temperature >=
                35
                  ? "High"
                  : "Normal"
              }
            />

            <Condition
              label="Water Tank"
              value={`${sensor.waterTank}%`}
              status={
                sensor.waterTank <=
                20
                  ? "Low"
                  : "Normal"
              }
            />

            <Condition
              label="Device"
              value={
                sensor.deviceOnline
                  ? "Online"
                  : "Offline"
              }
              status={
                sensor.deviceOnline
                  ? "Normal"
                  : "Offline"
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}

/* =====================================================
   SETTINGS
===================================================== */

function SettingsSection({
  autoWatering,
  setAutoWatering,
  simulator,
  setSimulator,
  sensor,
  user
}) {
  return (
    <>
      <section className="section-intro">
        <div>
          <span className="eyebrow">
            SYSTEM CONFIGURATION
          </span>

          <h2>
            Settings
          </h2>

          <p>
            Configure your cloud IoT
            monitoring system.
          </p>
        </div>
      </section>

      <div className="settings-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                AUTOMATION
              </span>

              <h3>
                Watering Settings
              </h3>
            </div>

            <Zap size={22} />
          </div>

          <SettingToggle
            title="Automatic Watering"
            description="Automatically water plants when their soil moisture falls below the configured threshold."
            enabled={
              autoWatering
            }
            onChange={
              setAutoWatering
            }
          />

          <div className="setting-note">
            Automatic watering is
            triggered according to each
            plant's moisture threshold.
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                SIMULATION
              </span>

              <h3>
                Virtual IoT Device
              </h3>
            </div>

            <Activity size={22} />
          </div>

          <SettingToggle
            title="Sensor Simulator"
            description="Generate virtual soil moisture, temperature, humidity, light and tank readings."
            enabled={simulator}
            onChange={
              setSimulator
            }
          />

          <div className="simulator-status">
            <span
              className={
                simulator
                  ? "pulse online"
                  : "pulse"
              }
            ></span>

            {simulator
              ? "Simulator running"
              : "Simulator stopped"}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                DEVICE
              </span>

              <h3>
                Device Status
              </h3>
            </div>

            <Wifi size={22} />
          </div>

          <div className="device-status-box">
            <div className="device-status-icon">
              <Wifi size={24} />
            </div>

            <div>
              <strong>
                {sensor.deviceOnline
                  ? "Device Online"
                  : "Device Offline"}
              </strong>

              <p>
                Virtual Plant Device
              </p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                ACCOUNT
              </span>

              <h3>
                Firebase Account
              </h3>
            </div>

            <User size={22} />
          </div>

          <div className="account-info">
            <span>
              Email
            </span>

            <strong>
              {user.email}
            </strong>

            <span>
              Authentication
            </span>

            <strong>
              Firebase Authentication
            </strong>

            <span>
              Database
            </span>

            <strong>
              Cloud Firestore
            </strong>
          </div>
        </div>
      </div>
    </>
  );
}

/* =====================================================
   COMPONENTS
===================================================== */

function StatCard({
  icon,
  title,
  value,
  unit,
  warning
}) {
  return (
    <div className="stat-card">
      <div
        className={
          warning
            ? "stat-icon warning-icon"
            : "stat-icon"
        }
      >
        {icon}
      </div>

      <div className="stat-info">
        <span>
          {title}
        </span>

        <strong>
          {value}
          <small>
            {unit}
          </small>
        </strong>

        <em>
          {warning
            ? "Needs attention"
            : "Normal"}
        </em>
      </div>
    </div>
  );
}

function SystemRow({
  icon,
  label,
  value,
  online
}) {
  return (
    <div className="system-row">
      <div className="system-label">
        <span className="system-icon">
          {icon}
        </span>

        {label}
      </div>

      <div
        className={
          online
            ? "system-value online"
            : "system-value"
        }
      >
        <span></span>
        {value}
      </div>
    </div>
  );
}

function MiniMetric({
  title,
  value,
  icon
}) {
  return (
    <div className="mini-metric">
      <div className="mini-icon">
        {icon}
      </div>

      <div>
        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>
      </div>
    </div>
  );
}

function EmptyPlants({
  setShowAddPlant
}) {
  return (
    <div className="empty-state">
      <Sprout size={45} />

      <h3>
        No plants yet
      </h3>

      <p>
        Add your first plant to
        start monitoring.
      </p>

      <button
        className="add-button"
        onClick={() =>
          setShowAddPlant(true)
        }
      >
        <Plus size={18} />
        Add Plant
      </button>
    </div>
  );
}

function SensorChart({
  data
}) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <Activity size={40} />

        <strong>
          Waiting for sensor data
        </strong>

        <p>
          Start the virtual IoT
          simulator to generate
          historical readings.
        </p>
      </div>
    );
  }

  const values = data.map(
    (item) =>
      Number(
        item.soilMoisture || 0
      )
  );

  const max =
    Math.max(...values, 100);

  const min =
    Math.min(...values, 0);

  const width = 800;
  const height = 280;
  const padding = 25;

  const points = values
    .map((value, index) => {
      const x =
        padding +
        (index /
          Math.max(
            values.length - 1,
            1
          )) *
          (width -
            padding * 2);

      const y =
        height -
        padding -
        ((value - min) /
          Math.max(
            max - min,
            1
          )) *
          (height -
            padding * 2);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="chart-wrapper">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="sensor-chart"
        preserveAspectRatio="none"
      >
        <line
          x1="25"
          y1="255"
          x2="775"
          y2="255"
          className="chart-axis"
        />

        <line
          x1="25"
          y1="25"
          x2="25"
          y2="255"
          className="chart-axis"
        />

        <polyline
          points={points}
          fill="none"
          className="chart-line"
        />
      </svg>

      <div className="chart-labels">
        <span>
          Oldest
        </span>

        <span>
          Latest
        </span>
      </div>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  enabled,
  onChange
}) {
  return (
    <div className="setting-row">
      <div>
        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>
      </div>

      <button
        className={
          enabled
            ? "toggle active"
            : "toggle"
        }
        onClick={() =>
          onChange(!enabled)
        }
      >
        <span></span>
      </button>
    </div>
  );
}

function Condition({
  label,
  value,
  status
}) {
  return (
    <div className="condition">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <em>
        {status}
      </em>
    </div>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function capitalize(value) {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function getSectionTitle(
  section
) {
  const titles = {
    dashboard: "Dashboard",
    plants: "My Plants",
    analytics: "Analytics",
    alerts: "Alerts",
    settings: "Settings"
  };

  return (
    titles[section] ||
    "Dashboard"
  );
}

function formatTimestamp(
  timestamp
) {
  if (
    !timestamp ||
    !timestamp.toDate
  ) {
    return "Just now";
  }

  return timestamp
    .toDate()
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
}

export default App;