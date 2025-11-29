# Student Dashboard Template

This is the starter template for the Student Dashboard project. It includes the core layout, navigation, and UI components.

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine.

### Installation
1.  **Clone the repository** (or unzip the folder):
    ```bash
    git clone <repository-url>
    cd student-dashboard
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

-   `src/App.tsx`: Main entry point containing the grid layout.
-   `src/components/DashboardCard.tsx`: The reusable card component.
-   `src/App.css`: Main styling file (Glassmorphism effects).
-   `src/index.css`: Global variables and theme settings.

## 🛠️ How to Contribute

You have been assigned one of the 7 modules. To start working on your module:

1.  **Create a new component** in `src/components/` (e.g., `TimeTable.tsx`).
2.  **Route to your component**:
    -   Currently, the cards are just visual placeholders.
    -   You will need to implement routing (using `react-router-dom`) or a modal system to show your module's details when a card is clicked.

## 🎨 Design Guidelines

-   **Theme**: The project uses a dark "glassmorphism" theme.
-   **Colors**: Use the CSS variables defined in `src/index.css` (e.g., `var(--accent-primary)`).
-   **Icons**: Use `lucide-react` for any new icons.

## 📝 Modules List

1.  **Time Table**
2.  **UPI Transactions**
3.  **Club & Events**
4.  **Reminders**
5.  **Students Count**
6.  **Bus Pass**
7.  **Polling**

Happy Coding! 🚀
