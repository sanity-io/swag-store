import { type SanityConfig } from "@sanity/sdk";
import { SanityApp } from "@sanity/sdk-react";
import { AttributionDashboard } from "./components/AttributionDashboard";
import { AttributionProvider } from "./components/AttributionProvider";
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
        fallback={
          <div className="bg-black h-screen w-screen flex items-center justify-center">
            <div className="text-white text-xl">
              Loading attribution dashboard...
            </div>
          </div>
        }
      >
        <AttributionProvider>
          <AttributionDashboard />
        </AttributionProvider>
      </SanityApp>
    </div>
  );
}

export default App;
