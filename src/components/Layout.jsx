import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import LoginModal from './LoginModal';
import CartOffcanvas from './CartOffcanvas';
import AuthToast from './AuthToast';
import { LayoutContext } from '../context/LayoutContextValues';

export default function Layout() {
  const [activeModal, setActiveModal] = useState(null); // 'login', 'register', or null
  const [authToast, setAuthToast] = useState(false);

  const showAuthToast = () => setAuthToast(true);
  const hideAuthToast = () => setAuthToast(false);

  return (
    <LayoutContext.Provider value={{ setActiveModal, showAuthToast }}>
      <Navbar 
        onOpenLogin={() => setActiveModal('login')} 
        onOpenRegister={() => setActiveModal('register')} 
      />
      
      <main>
        <Outlet />
      </main>

      <Footer />
      
      <LoginModal 
        activeModal={activeModal} 
        setActiveModal={setActiveModal} 
      />

      <AuthToast
        show={authToast}
        message="Please log in to continue with your purchase."
        onClose={hideAuthToast}
        onLogin={() => setActiveModal('login')}
      />
      
      <CartOffcanvas />
    </LayoutContext.Provider>
  );
}
