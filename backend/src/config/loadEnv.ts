import dotenv from "dotenv";
import path from "path";

// Load local defaults before modules read process.env, while preserving values
// injected by the deployment platform or test runner.
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
