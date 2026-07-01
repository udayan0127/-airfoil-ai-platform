import { motion } from "framer-motion";
import "../styles/components.css";

function TabNav({ activeTab, setActiveTab, hasResults }) {
  const tabs = [
    { id: "input", label: "🎯 Input & Analysis", disabled: false },
    { id: "3d", label: "🛩️ 3D Viewer", disabled: !hasResults },
    { id: "polar", label: "📈 Drag Polar", disabled: !hasResults },
    { id: "compare", label: "⚖️ Compare", disabled: !hasResults },
    { id: "sweep", label: "🌀 Re Sweep", disabled: !hasResults }
  ];

  return (
    <nav className="tab-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? "active" : ""} ${tab.disabled ? "disabled" : ""}`}
          onClick={() => !tab.disabled && setActiveTab(tab.id)}
          disabled={tab.disabled}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              className="tab-indicator"
              layoutId="tab-indicator"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
}

export default TabNav;