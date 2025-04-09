import { useNavigate } from 'react-router-dom';
import { useBriefings } from '../contexts/BriefingContext';

export default function BriefingListPage() {
  const navigate = useNavigate();
  const { briefings, loading, error, hasMore, loadMore } = useBriefings();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meus Briefings</h1>
        <button
          onClick={() => navigate('/create')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Criar Novo Briefing
        </button>
      </div>

      {loading && briefings.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl">Carregando briefings...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      ) : briefings.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <p className="text-xl text-gray-600 mb-4">Nenhum briefing encontrado</p>
          <button
            onClick={() => navigate('/create')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Criar seu primeiro briefing
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {briefings.map((briefing) => (
              <div
                key={briefing.id}
                onClick={() => navigate(`/briefings/${briefing.id}`)}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <h2 className="text-xl font-semibold mb-2">{briefing.title}</h2>
                <p className="text-gray-600 mb-4">
                  {new Date(briefing.created_at).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-gray-700 line-clamp-3">
                  {briefing.content}
                </p>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Carregando...' : 'Carregar Mais'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 