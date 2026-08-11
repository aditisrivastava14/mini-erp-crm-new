import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

export const DashboardOverview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back to your GigFlow dashboard. Here's what's happening today.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary">Download Report</Button>
          <Button>New Client</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Revenue', value: '$45,231.89', change: '+20.1%' },
          { title: 'Active Clients', value: '+2350', change: '+180.1%' },
          { title: 'New Leads', value: '12,234', change: '+19%' },
          { title: 'Active Projects', value: '573', change: '+201 since last hour' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground flex flex-row items-center justify-between pb-2">
              {stat.title}
            </h3>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 border border-border rounded-xl p-6 bg-card h-96 flex items-center justify-center">
          <p className="text-muted-foreground">Chart Area (Coming Soon)</p>
        </div>
        <div className="lg:col-span-3 border border-border rounded-xl p-6 bg-card h-96 flex flex-col">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Activity Feed (Coming Soon)</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
