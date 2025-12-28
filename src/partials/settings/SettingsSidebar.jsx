import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function SettingsSidebar() {

  const location = useLocation();
  const { pathname } = location;

  return (
    <div className="flex flex-nowrap overflow-x-scroll no-scrollbar md:block md:overflow-auto px-3 py-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700/60 min-w-[15rem] md:space-y-3">
      {/* Group 1 */}
      <div>
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">Business settings</div>
        <ul className="flex flex-nowrap md:block mr-3 md:mr-0">
          <li className="mr-0.5 md:mr-0 md:mb-0.5">
            <NavLink end to="/settings/account" className={`flex items-center px-2.5 py-2 rounded-lg whitespace-nowrap ${pathname.includes('/settings/account') && 'bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]'}`}>
              <svg className={`shrink-0 fill-current mr-4 ${pathname.includes('/settings/account') ? 'text-violet-500 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'}`} width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-5.143 7.91a1 1 0 1 1-1.714-1.033A7.996 7.996 0 0 1 8 10a7.996 7.996 0 0 1 6.857 3.877 1 1 0 1 1-1.714 1.032A5.996 5.996 0 0 0 8 12a5.996 5.996 0 0 0-5.143 2.91Z" />
              </svg>
              <span className={`text-sm font-medium ${pathname.includes('/settings/account') ? 'text-violet-500 dark:text-violet-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'}`}>My Account</span>
            </NavLink>
          </li>
          <li className="mr-0.5 md:mr-0 md:mb-0.5">
            <NavLink end to="/settings/api-keys" className={`flex items-center px-2.5 py-2 rounded-lg whitespace-nowrap ${pathname.includes('/settings/api-keys') && 'bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]'}`}>
              <svg className={`shrink-0 fill-current mr-4 ${pathname.includes('/settings/api-keys') ? 'text-violet-500 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'}`} width="16" height="16" viewBox="0 0 16 16">
                <path d="M10.5 1a4.5 4.5 0 0 0-3.75 7h-1.5a1.25 1.25 0 0 0-1.147.76l-.618 1.49-1.59.398a.75.75 0 0 0-.447 1.12l1.5 2.5a.75.75 0 0 0 1.272.024l.883-1.324a.75.75 0 0 0 .107-.385v-.544h.75a.75.75 0 0 0 .53-.22l2.03-2.03a4.5 4.5 0 1 0 1.96-8.788Zm0 1.5a3 3 0 1 1-2.4 4.8.75.75 0 0 0-.6-.3H5.25a.75.75 0 0 0-.692.46l-.777 1.873a.75.75 0 0 0 .55 1.017l1.07.214v.936a.75.75 0 0 0 .12.406l.004.005-1.003 1.504-.811-1.352a.75.75 0 0 0-.493-.345L1.96 12.2l.482-.12a.75.75 0 0 0 .522-.445l.7-1.69a.25.25 0 0 1 .233-.155h1.653a.75.75 0 0 0 .53-.22l.377-.376a.75.75 0 0 0-.048-1.111A3 3 0 0 1 10.5 2.5Zm1.25 2.25a.75.75 0 0 0-1.5 0v1h-1a.75.75 0 0 0 0 1.5h1v1a.75.75 0 0 0 1.5 0v-1h1a.75.75 0 0 0 0-1.5h-1v-1Z" />
              </svg>
              <span className={`text-sm font-medium ${pathname.includes('/settings/api-keys') ? 'text-violet-500 dark:text-violet-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'}`}>API Keys</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SettingsSidebar;
