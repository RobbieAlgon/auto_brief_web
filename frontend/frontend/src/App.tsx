import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BriefingProvider } from './contexts/BriefingContext';
import { BriefingGenerator } from './components/BriefingGenerator';
import BriefingListPage from './pages/BriefingListPage';
import BriefingDetailPage from './pages/BriefingDetailPage';
import { Link } from 'react-router-dom';

function AppContent() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-xl font-semibold text-gray-900">
                Briefing Generator
              </Link>
              {user && (
                <div className="hidden md:flex space-x-4">
                  <Link
                    to="/briefings"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Briefings
                  </Link>
                  <Link
                    to="/create"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Create New
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                  <button
                    onClick={signOut}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Sign Out
                  </button>
      </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Sign in with Google
        </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/briefings" replace />
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold mb-4">
                    Welcome to Briefing Generator
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Please sign in to start creating briefings
                  </p>
                  <button
                    onClick={signInWithGoogle}
                    className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Sign in with Google
                  </button>
      </div>
              )
            }
          />
          <Route
            path="/briefings"
            element={
              user ? (
                <BriefingListPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/briefings/:id"
            element={
              user ? (
                <BriefingDetailPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/create"
            element={
              user ? (
                <BriefingGenerator />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <BriefingProvider>
          <AppContent />
        </BriefingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
