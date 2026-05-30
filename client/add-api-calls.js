/* eslint-disable no-undef */
import fs from 'fs';
import path from 'path';

// Update Login.jsx
const loginPath = path.join(process.cwd(), 'src/pages/Login.jsx');
let loginCode = fs.readFileSync(loginPath, 'utf8');

loginCode = loginCode.replace(/import \* as z from 'zod';/, `import * as z from 'zod';\nimport { login } from '../api/auth';\nimport { useNavigate } from 'react-router-dom';`);

loginCode = loginCode.replace(/export default function Login\(\) \{/s, `export default function Login() {\n  const navigate = useNavigate();\n  const [loading, setLoading] = React.useState(false);\n  const [apiError, setApiError] = React.useState('');`);

loginCode = loginCode.replace(/const onSubmit = \(data\) => \{([\s\S]*?)\};/s, `const onSubmit = async (data) => {
    try {
      setLoading(true);
      setApiError('');
      const response = await login(data);
      localStorage.setItem('accessToken', response.accessToken);
      // Optional: Store user data
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };`);

loginCode = loginCode.replace(/<form className="flex flex-col gap-6" onSubmit=\{handleSubmit\(onSubmit\)\}>/s, `<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>\n              {apiError && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium">{apiError}</div>}`);

loginCode = loginCode.replace(/<button className="w-full h-\[56px\] bg-primary hover:bg-primary\/90 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"/g, `<button disabled={loading} className="w-full h-[56px] bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 disabled:opacity-70"`);


// Update Register.jsx
const registerPath = path.join(process.cwd(), 'src/pages/Register.jsx');
let registerCode = fs.readFileSync(registerPath, 'utf8');

registerCode = registerCode.replace(/import \* as z from 'zod';/, `import * as z from 'zod';\nimport { register as registerUser } from '../api/auth';\nimport { useNavigate } from 'react-router-dom';`);

registerCode = registerCode.replace(/export default function Register\(\) \{/s, `export default function Register() {\n  const navigate = useNavigate();\n  const [loading, setLoading] = React.useState(false);\n  const [apiError, setApiError] = React.useState('');`);

registerCode = registerCode.replace(/const onSubmit = \(data\) => \{([\s\S]*?)\};/s, `const onSubmit = async (data) => {
    try {
      setLoading(true);
      setApiError('');
      // Send data excluding confirmPassword
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      navigate('/login');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };`);

registerCode = registerCode.replace(/<form className="flex flex-col gap-5" onSubmit=\{handleSubmit\(onSubmit\)\}>/s, `<form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>\n              {apiError && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium">{apiError}</div>}`);

registerCode = registerCode.replace(/<button className="w-full h-\[56px\] bg-primary hover:bg-primary\/90 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"/g, `<button disabled={loading} className="w-full h-[56px] bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 disabled:opacity-70"`);

fs.writeFileSync(loginPath, loginCode);
fs.writeFileSync(registerPath, registerCode);

console.log("Forms API integrated successfully");
