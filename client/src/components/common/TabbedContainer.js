// client/src/components/common/TabbedContainer.js
import React, { useState } from 'react';

const TabbedContainer = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(tabs[0].key);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition ease-in-out duration-150 
                                ${activeTab === tab.key
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div>
                {tabs.map((tab) => (
                    <div key={tab.key} className={activeTab === tab.key ? 'block' : 'hidden'}>
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TabbedContainer;