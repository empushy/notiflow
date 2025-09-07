import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import Image from '../../images/user-avatar-80.png';

function AccountPanel() {

  const [sync, setSync] = useState(false);
  const { user } = useAuth0();

  return (
    <div className="grow">
      {/* Panel body */}
      <div className="p-6 space-y-6">
        <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-5">My Account</h2>
        
        {/* Email */}
        <section>
          <h2 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-1">Email</h2>
          <div className="text-sm">This is the email you signed up with.</div>
          <div className="flex flex-wrap mt-5">
            <div className="mr-2">
              <label className="sr-only" htmlFor="email">Business email</label>
              <input id="email" className="form-input" type="email" placeholder={user.email ? user.email : "error"} disabled />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AccountPanel;