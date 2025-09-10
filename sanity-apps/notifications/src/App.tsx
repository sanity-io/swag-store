import { type SanityConfig } from "@sanity/sdk";
import { SanityApp } from "@sanity/sdk-react";
import { NotificationCenter } from "./components/NotificationCenter";
import { NotificationProvider } from "./components/NotificationProvider";
import "./App.css";

function App() {
  // apps can access many different projects or other sources of data
  const sanityConfigs: SanityConfig[] = [
    {
      projectId: "l3u4li5b",
      dataset: "production",
    },
  ];

  return (
    <div className="app-container">
      <SanityApp
        config={sanityConfigs}
        fallback={<div>Loading notifications...</div>}
      >
        <NotificationProvider>
          <NotificationCenter />
        </NotificationProvider>
      </SanityApp>
    </div>
  );
}

export default App;
