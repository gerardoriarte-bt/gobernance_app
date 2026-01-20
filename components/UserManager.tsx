
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { UserRole } from '../types';
import { Users, Plus, Edit2, Trash2, X, Check, Shield } from 'lucide-react';

const UserManager: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'planner' as UserRole
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'planner' });
    setIsAdding(false);
    setIsEditing(null);
  };

  const handleEditClick = (user: any) => {
    setFormData({ name: user.name, email: user.email, role: user.role });
    setIsEditing(user.id);
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      updateUser(isEditing, formData);
    } else {
      addUser(formData);
    }
    resetForm();
  };

  const roles: { id: UserRole, label: string, color: string }[] = [
    { id: 'admin', label: 'Super Admin', color: 'bg-indigo-100 text-indigo-700' },
    { id: 'planner', label: 'Media Planner', color: 'bg-emerald-100 text-emerald-700' },
    { id: 'trafficker', label: 'Trafficker', color: 'bg-amber-100 text-amber-700' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden mb-10">
      <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Users size={20} />
           </div>
           <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">User Management</h3>
              <p className="text-xs text-slate-500 font-medium">Control access and roles for the organization.</p>
           </div>
        </div>
        
        {!isAdding && !isEditing && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-indigo-600 transition-all shadow-md active:scale-95"
          >
            <Plus size={16} /> Add User
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Form Area */}
        {(isAdding || isEditing) && (
          <form onSubmit={handleSubmit} className="mb-8 bg-slate-50/50 p-6 rounded-2xl border-2 border-slate-100 animate-in fade-in slide-in-from-top-2">
             <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
               {isEditing ? 'Edit User Profile' : 'New User Setup'}
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                   <input 
                      required
                      type="text" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      placeholder="e.g. Jane Doe"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                   <input 
                      required
                      type="email" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role Assignment</label>
                   <select 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                   >
                      {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                   </select>
                </div>
             </div>
             <div className="flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2 text-slate-400 font-bold text-xs hover:text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-slate-900 transition-colors shadow-lg shadow-indigo-100"
                >
                  {isEditing ? 'Save Changes' : 'Create User'}
                </button>
             </div>
          </form>
        )}

        {/* User List Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-16">Avatar</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User Details</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {users.map(user => {
                    const roleConfig = roles.find(r => r.id === user.role);
                    const isMe = currentUser?.id === user.id;

                    return (
                       <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                             <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm" alt="avatar" />
                          </td>
                          <td className="px-6 py-4">
                             <div className="font-bold text-slate-900 flex items-center gap-2">
                                {user.name} 
                                {isMe && <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wide">You</span>}
                             </div>
                             <div className="text-xs text-slate-400 font-medium">{user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${roleConfig?.color}`}>
                                {roleConfig?.label}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             {!isMe && (
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                      onClick={() => handleEditClick(user)}
                                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                      title="Edit User"
                                   >
                                      <Edit2 size={16} />
                                   </button>
                                   <button 
                                      onClick={() => {
                                         if(confirm('Delete user?')) deleteUser(user.id);
                                      }}
                                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete User"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             )}
                          </td>
                       </tr>
                    );
                 })}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
