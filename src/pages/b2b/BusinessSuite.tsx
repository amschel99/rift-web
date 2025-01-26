import { Link } from "react-router";

function BusinessSuite() {
  return (
    <div className="h-screen bg-primary">
      <h1 className="text-textprimary text-xl">B2B page</h1>
      <Link to="/app">Back</Link>
    </div>
  );
}

export default BusinessSuite;
