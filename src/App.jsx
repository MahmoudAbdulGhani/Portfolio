import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-text-primary select-none sm:select-auto">
      <Header />
      <div className="flex-1">
        <Home />
      </div>
      <Footer />
    </div>
  );
}

export default App;