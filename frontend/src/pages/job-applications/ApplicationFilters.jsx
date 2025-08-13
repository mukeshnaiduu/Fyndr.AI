import React from "react";

const ApplicationFilters = ({ filters, onFilterChange, applications }) => {
  // Get unique companies from applications
  const uniqueCompanies = [...new Set(applications.map(app => app.company))].sort();

  const statusOptions = [
    { value: 'all', label: 'All Statuses', count: applications.length },
    { value: 'applied', label: 'Applied', count: applications.filter(app => app.status === 'applied').length },
    { value: 'reviewing', label: 'Under Review', count: applications.filter(app => app.status === 'reviewing').length },
    { value: 'interview', label: 'Interview', count: applications.filter(app => app.status === 'interview').length },
    { value: 'offer', label: 'Offer', count: applications.filter(app => app.status === 'offer').length },
    { value: 'rejected', label: 'Rejected', count: applications.filter(app => app.status === 'rejected').length },
    { value: 'withdrawn', label: 'Withdrawn', count: applications.filter(app => app.status === 'withdrawn').length },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'Past Month' },
    { value: 'quarter', label: 'Past 3 Months' },
  ];

  const handleSearchChange = (e) => {
    onFilterChange({ searchQuery: e.target.value });
  };

  const handleStatusChange = (e) => {
    onFilterChange({ status: e.target.value });
  };

  const handleCompanyChange = (e) => {
    onFilterChange({ company: e.target.value });
  };

  const handleDateRangeChange = (e) => {
    onFilterChange({ dateRange: e.target.value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      status: 'all',
      company: 'all',
      dateRange: 'all',
      searchQuery: ''
    });
  };

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.company !== 'all' || 
                          filters.dateRange !== 'all' || 
                          filters.searchQuery !== '';

  return (
    <div className="mb-8">
      <div className="glass-card p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Filter Applications</h2>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>🔄</span>
              Clear all filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search Input */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-foreground mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-muted-foreground"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground">🔍</span>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.count > 0 && `(${option.count})`}
                </option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Company
            </label>
            <select
              value={filters.company}
              onChange={handleCompanyChange}
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="all">All Companies</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date Applied
            </label>
            <select
              value={filters.dateRange}
              onChange={handleDateRangeChange}
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground mr-2">Quick filters:</span>
          {statusOptions.slice(1).filter(option => option.count > 0).map(option => (
            <button
              key={option.value}
              onClick={() => onFilterChange({ status: option.value })}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filters.status === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/60 text-muted-foreground hover:bg-white/80'
              }`}
            >
              {option.label}
              <span className="bg-white/20 text-xs px-1 rounded">
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicationFilters;
