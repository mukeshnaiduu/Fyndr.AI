import React from "react";

const ApplicationStats = ({ applications }) => {
  const totalApplications = applications.length;
  const activeApplications = applications.filter(app => 
    ['applied', 'reviewing', 'interview'].includes(app.status)
  ).length;
  const interviewCount = applications.filter(app => app.status === 'interview').length;
  const offerCount = applications.filter(app => app.status === 'offer').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;
  
  // Calculate response rate (applications that moved beyond 'applied' status)
  const respondedApplications = applications.filter(app => 
    app.status !== 'applied' && app.status !== 'withdrawn'
  ).length;
  const responseRate = totalApplications > 0 ? Math.round((respondedApplications / totalApplications) * 100) : 0;

  // Calculate this week's applications
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekApplications = applications.filter(app => 
    new Date(app.appliedDate) >= oneWeekAgo
  ).length;

  const stats = [
    {
      title: "Total Applications",
      value: totalApplications,
      icon: "📋",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "All time applications"
    },
    {
      title: "Active Applications",
      value: activeApplications,
      icon: "⏳",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      description: "Currently in progress"
    },
    {
      title: "Interviews",
      value: interviewCount,
      icon: "🎯",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Interview opportunities"
    },
    {
      title: "Response Rate",
      value: `${responseRate}%`,
      icon: "📈",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "Companies that responded"
    },
    {
      title: "This Week",
      value: thisWeekApplications,
      icon: "📅",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      description: "Applications this week"
    },
    {
      title: "Offers",
      value: offerCount,
      icon: "🎉",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      description: "Job offers received"
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`glass-card p-4 rounded-xl border ${stat.borderColor} hover:shadow-glassmorphic transition-all duration-300 hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center text-lg`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">
                {stat.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Quick Stats */}
      <div className="mt-4 glass-card p-4 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Interview Rate: {totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Rejection Rate: {totalApplications > 0 ? Math.round((rejectedCount / totalApplications) * 100) : 0}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              Offer Rate: {totalApplications > 0 ? Math.round((offerCount / totalApplications) * 100) : 0}%
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStats;
