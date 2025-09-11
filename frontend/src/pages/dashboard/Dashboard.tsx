import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const Dashboard = () => {
  return(
    <div>
      <h1>Dashboard</h1>
      <Card>
        <p>Welcome to the dashboard!</p>
      <Input  placeholder="Type something..." />
      </Card>
    </div>
  );
}

export default Dashboard