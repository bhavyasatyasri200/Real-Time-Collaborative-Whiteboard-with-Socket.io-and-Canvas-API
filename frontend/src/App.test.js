import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders whiteboard title", () => {
  render(<App />);
  const element = screen.getByText(/whiteboard/i);
  expect(element).toBeInTheDocument();
});