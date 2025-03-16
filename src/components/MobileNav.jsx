import { useRef, useState, useEffect } from 'react';
import { Squash as Hamburger } from 'hamburger-react';
import { useClickAway } from 'react-use';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { routes } from '../data/routes';

function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  useClickAway(ref, () => setIsOpen(false));

  return (
    <nav 
      ref={ref}
      className={`fixed top-0 left-0 w-full h-16 bg-brand-blue shadow-lg z-50 transition-transform duration-300 text-white ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className='relative container top-3 grid grid-cols-5 gap-6'>
        <Link to="/" className="relative ml-5 text-2xl top-2 font-bold col-span-4 transition-colors">
          Flores Dog Training
        </Link>
        <Hamburger toggled={isOpen} size={20} toggle={setIsOpen} />
      </div>
      <AnimatePresence>
      {
        isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 shadow-4xl right-0 top-[3.5rem] p-5 pt-0"
          >
            <ul className='grid gap-2 z-20 mt-4'>
              {
                routes.map((route, idx) => (
                  <motion.li
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.1 + idx / 10,
                    }}
                    key={route.id}
                    className="w-full p-[0.08rem] rounded-xl bg-gradient-to-tr from-brand-teal/20 via-brand-teal/40 to-brand-teal/60"
                  >
                  <a
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={
                      "flex items-center justify-between w-full p-5 rounded-xl bg-brand-teal-light/80"
                    }
                    href={route.path}
                  >
                    <span className="flex gap-1 font-bold text-lg">{route.name}</span>
                    </a>
                  </motion.li>
                ))
              }
            </ul>
          </motion.div>
        )
      }
      </AnimatePresence>
    </nav>
  );
}

export default MobileNav;