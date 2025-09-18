import { render, screen, fireEvent } from "@testing-library/react";
import Home from "../Home";

// Mock alert
window.alert = jest.fn();

test("renders navbar links", () => {
  render(<Home />);
  expect(screen.getByText(/Home/i)).toBeInTheDocument();
  expect(screen.getByText(/About/i)).toBeInTheDocument();
  expect(screen.getByText(/Booking/i)).toBeInTheDocument();
  expect(screen.getByText(/Awarness & Blog/i)).toBeInTheDocument();
  expect(screen.getByText(/Contact/i)).toBeInTheDocument();
});

test("shows login/register when user is not logged in", () => {
  render(<Home />);
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
  expect(screen.getByText(/Register/i)).toBeInTheDocument();
});

test("updates form fields", () => {
  render(<Home />);
  const nameInput = screen.getByPlaceholderText(/Your Name/i);
  fireEvent.change(nameInput, { target: { value: "John" } });
  expect(nameInput.value).toBe("John");
});

test("submits contact form", () => {
  render(<Home />);
  const form = screen.getByRole("form"); // you may need role or testid
  fireEvent.submit(form);
  expect(window.alert).toHaveBeenCalledWith("Pretend form submitted (no backend)");
});
