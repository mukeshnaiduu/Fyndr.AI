import React from 'react';

const JobFeedFilters = ({ onFilter }) => {
    return (
        <aside className="hidden lg:block lg:col-span-2">
            <div className="bg-glass-card rounded-card p-4 mb-6">
                <h2 className="font-bold text-lg mb-4">Filters</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Job Type</label>
                        <select className="w-full bg-background border border-glass-border rounded px-2 py-1">
                            <option>All</option>
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <input type="text" className="w-full bg-background border border-glass-border rounded px-2 py-1" placeholder="Enter location" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Salary Range</label>
                        <input type="range" min="50000" max="250000" className="w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Remote Only</label>
                        <input type="checkbox" className="mr-2" /> Yes
                    </div>
                </div>
                <button className="mt-6 w-full bg-primary text-primary-foreground py-2 rounded font-semibold">Apply Filters</button>
            </div>
        </aside>
    );
};

export default JobFeedFilters;
