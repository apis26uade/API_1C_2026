const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace AuthContext imports with Redux imports
  if (content.includes('useAuth')) {
    content = content.replace(/import\s*\{\s*useAuth\s*\}\s*from\s*['"]\.\.?\/context\/AuthContext(\.jsx)?['"];?/, 
      `import { useSelector, useDispatch } from 'react-redux';\nimport { logout } from '${path.relative(path.dirname(file), path.join(srcDir, 'features/auth/authSlice.js')).replace(/\\/g, '/')}';\nimport { loginUser, registerUser } from '${path.relative(path.dirname(file), path.join(srcDir, 'features/auth/authThunks.js')).replace(/\\/g, '/')}';`);
    
    // Replace const { ... } = useAuth() with Redux selections
    // This is tricky because it depends on what is extracted. 
    // We will find the const { ... } = useAuth() line and replace it.
    const match = content.match(/const\s+\{([^}]+)\}\s*=\s*useAuth\(\)/);
    if (match) {
      const extracted = match[1].split(',').map(s => s.trim()).filter(Boolean);
      let newLines = [];
      
      // Need dispatch?
      if (extracted.includes('login') || extracted.includes('register') || extracted.includes('logout') || !content.includes('useDispatch(')) {
         if (!content.includes('const dispatch = useDispatch()')) {
            newLines.push('  const dispatch = useDispatch();');
         }
      }
      
      if (extracted.includes('user') || extracted.includes('isAuthenticated') || extracted.includes('isAdmin')) {
         newLines.push('  const { user, isAuthenticated } = useSelector(state => state.auth);');
         if (extracted.includes('isAdmin')) {
           newLines.push("  const isAdmin = user?.role === 'ROLE_ADMIN';");
         }
      }
      
      // Handle login/register functions if used
      if (extracted.includes('login')) {
         newLines.push('  const login = async (email, password) => { return dispatch(loginUser({ email, password })).unwrap(); };');
      }
      if (extracted.includes('register')) {
         newLines.push('  const register = async (name, email, password) => { return dispatch(registerUser({ name, email, password })).unwrap(); };');
      }
      if (extracted.includes('logout')) {
         newLines.push('  const handleLogout = () => dispatch(logout());');
         content = content.replace(/logout\(/g, 'handleLogout(');
         content = content.replace(/onClick=\{logout\}/g, 'onClick={handleLogout}');
      }
      
      content = content.replace(match[0], newLines.join('\n'));
    }
    changed = true;
  }

  // Very basic CartContext replacement for components
  if (content.includes('useCart')) {
    content = content.replace(/import\s*\{\s*useCart\s*\}\s*from\s*['"]\.\.?\/context\/CartContext(\.jsx)?['"];?/, 
      `import { useSelector, useDispatch } from 'react-redux';\nimport { addLocalItem, updateLocalItemQuantity, removeLocalItem, clearCart } from '${path.relative(path.dirname(file), path.join(srcDir, 'features/cart/cartSlice.js')).replace(/\\/g, '/')}';`);
    
    const matchCart = content.match(/const\s+\{([^}]+)\}\s*=\s*useCart\(\)/);
    if (matchCart) {
      const extracted = matchCart[1].split(',').map(s => s.trim()).filter(Boolean);
      let newLines = [];
      
      if (!content.includes('const dispatch = useDispatch()')) {
         newLines.push('  const dispatch = useDispatch();');
      }
      
      newLines.push('  const { items, itemCount, subtotal, total, appliedDiscount } = useSelector(state => state.cart);');
      
      if (extracted.includes('addItem')) {
         newLines.push('  const addItem = (product, quantity = 1) => dispatch(addLocalItem({ product, quantity }));');
      }
      if (extracted.includes('removeItem')) {
         newLines.push('  const removeItem = (id) => dispatch(removeLocalItem(id));');
      }
      if (extracted.includes('updateQuantity')) {
         newLines.push('  const updateQuantity = (idProduct, quantity) => dispatch(updateLocalItemQuantity({ idProduct, quantity }));');
      }
      if (extracted.includes('clearCart')) {
         newLines.push('  const handleClearCart = () => dispatch(clearCart());');
         content = content.replace(/clearCart\(\)/g, 'handleClearCart()');
         content = content.replace(/onClick=\{clearCart\}/g, 'onClick={handleClearCart}');
      }
      
      content = content.replace(matchCart[0], newLines.join('\n'));
    }
    changed = true;
  }

  if (changed) {
    // Deduplicate redux imports
    let hasRedux = false;
    const finalContent = content.split('\n').filter(line => {
       if (line.includes("from 'react-redux'")) {
          if (hasRedux) return false;
          hasRedux = true;
          return true;
       }
       return true;
    }).join('\n');
    fs.writeFileSync(file, finalContent, 'utf8');
  }
});

console.log("Refactoring complete.");
