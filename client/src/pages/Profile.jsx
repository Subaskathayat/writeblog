import { useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Avatar from '../components/Avatar.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    password: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      username: form.username,
      bio: form.bio,
      avatar: form.avatar,
    };
    if (form.password) payload.password = form.password;
    try {
      const { data } = await api.put('/auth/profile', payload);
      updateUser(data.user);
      setForm({ ...form, password: '' });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section">
      <div className="container-narrow" style={{ maxWidth: 560 }}>
        <h1 className="t-section-heading">Your profile</h1>

        <div className="row gap-lg mt-xl">
          <Avatar user={{ ...user, avatar: form.avatar }} size={64} />
          <div className="stack">
            <span className="t-feature-heading">{form.username || user?.username}</span>
            <span className="text-muted">{user?.email}</span>
          </div>
        </div>

        <form className="mt-xxl" onSubmit={submit}>
          <div className="field">
            <label>Username</label>
            <input className="input" value={form.username} onChange={set('username')} />
          </div>

          <div className="field">
            <label>Avatar URL</label>
            <input
              className="input"
              value={form.avatar}
              onChange={set('avatar')}
              placeholder="https://…"
            />
          </div>

          <div className="field">
            <label>Bio</label>
            <textarea
              className="textarea"
              value={form.bio}
              onChange={set('bio')}
              maxLength={500}
              placeholder="Tell readers a little about yourself"
            />
          </div>

          <div className="field">
            <label>New password (leave blank to keep current)</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••"
            />
          </div>

          <button className="btn btn-primary mt-md" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </section>
  );
}
