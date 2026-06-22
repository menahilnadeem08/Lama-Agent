import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-core/v2/styles.css";
import './globals.css';

// ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CopilotKit runtimeUrl="/api/copilotkit" agent="my_agent"   publicApiKey="ck_pub_f6f6ca88f04b7ea4fdb880382882c732">
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}