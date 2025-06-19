
import { Layout } from "@/components/Layout";

const Leaderboard = () => {
  return (
    <Layout customTitle="Leaderboard" showBackButton>
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
          <p className="text-muted-foreground">Coming soon! Track the top roasters and their epic burns.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
