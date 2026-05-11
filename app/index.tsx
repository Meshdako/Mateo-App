import { StatusBar } from "expo-status-bar";
import { GradeCalculatorView } from "@/src/views";

export default function Index() {
  return (
    <>
      <StatusBar style="light" />
      <GradeCalculatorView />
    </>
  );
}
