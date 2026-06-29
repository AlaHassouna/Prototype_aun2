import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '../../services/api';
import toast from 'react-hot-toast';

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function Media() {
  const qc   = useQueryClient();
  const input = useRef();
  const [filter, setFilter] = useState('');

  const { data: items = [] } = useQuery({
    queryKey: ['media', filter],
    queryFn: () => mediaApi.getAll(filter ? { type: filter } : {}).then(r => r.data),
  });

  const upload = useMutation({
    mutationFn: (files) => {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('files', f));
      return mediaApi.upload(fd);
    },
    onSuccess: () => { toast.success('Fichiers importés'); qc.invalidateQueries(['media']); },
    onError:   () => toast.error('Erreur upload'),
  });

  const remove = useMutation({
    mutationFn: mediaApi.remove,
    onSuccess: () => qc.invalidateQueries(['media']),
    onError:   () => toast.error('Erreur suppression'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-gold">Médiathèque</h1>
        <button onClick={() => input.current.click()}
          className="px-6 py-2 bg-gold text-navy text-sm font-semibold uppercase tracking-widest hover:bg-gold-light transition-colors">
          + Importer
        </button>
        <input ref={input} type="file" multiple accept="image/*,video/*" className="hidden"
          onChange={e => upload.mutate(e.target.files)} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[['', 'Tous'], ['image', 'Images'], ['video', 'Vidéos']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${filter === v ? 'bg-gold text-navy' : 'border border-gold/20 text-gold/50 hover:border-gold/50'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map(item => (
          <div key={item.id} className="group relative bg-navy-800 border border-gold/10 rounded-xl overflow-hidden">
            {item.type === 'image'
              ? <img src={item.url} alt={item.original_name} className="w-full aspect-square object-cover" />
              : (
                <div className="w-full aspect-square bg-navy-700 flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
              )
            }
            <div className="p-2">
              <p className="text-gold/60 text-xs truncate">{item.original_name}</p>
              <p className="text-gold/30 text-xs">{fmtSize(item.size)}</p>
            </div>
            <button onClick={() => remove.mutate(item.id)}
              className="absolute top-2 right-2 w-6 h-6 bg-red-900/80 text-red-300 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              ×
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-center py-20 text-gold/30">Aucun média</div>}
      </div>
    </div>
  );
}
