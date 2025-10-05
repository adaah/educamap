import { useEffect, useRef, useState } from 'react';
// IMPORTANTE: Trocando Mapbox por Leaflet
import L, { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Importa o CSS do Leaflet

import { type School } from '@/data/schools';
import { useSchools } from '@/hooks/useSchools';
import { useNavigate } from 'react-router-dom';
import { MapSearch } from './MapSearch';

// IMPORTANTE: Configuração de Ícone para corrigir o marcador padrão do Leaflet
// Isso é necessário pois o Webpack/Vite tem dificuldade em encontrar os ícones padrão
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
// Fim da correção do ícone

interface MapComponentProps {
  selectedSchool?: string;
  onSchoolSelect?: (school: School) => void;
}

const MapComponent = ({ selectedSchool, onSchoolSelect }: MapComponentProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<LeafletMap | null>(null); 
    const [selectedPopup, setSelectedPopup] = useState<School | null>(null);
    const navigate = useNavigate();
    const { data: schools = [], isLoading } = useSchools();

    // -------------------------------------------------------------------------
    // Função para renderizar o mapa (o coração da mudança)
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!mapContainer.current) return;

        // Verifica se o mapa já foi inicializado para evitar duplicidade
        if (map.current) {
             // Limpeza se o mapa já existir (para evitar warnings em desenvolvimento)
             map.current.remove();
             map.current = null;
        }

        // 1. Inicializa o mapa no elemento 'div' com o id="mapa"
        // Coordenadas de Salvador: [-12.9714, -38.5014]
        map.current = L.map(mapContainer.current!).setView([-12.9714, -38.5014], 13);

        // 2. Adiciona os Tiles (OpenStreetMap - 100% gratuito)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map.current!);

        // 3. Criar ícones customizados para as escolas
        const createCustomIcon = (school: any) => {
            const color = school.nature === 'Pública' ? '#fbbf24' : '#f97316'; // Amber for public, Orange for private
            
            return L.divIcon({
                className: 'custom-pin',
                html: `
                    <div style="
                        width: 30px;
                        height: 30px;
                        background-color: ${color};
                        border: 3px solid white;
                        border-radius: 50%;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                    ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                    </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            });
        };

        // 4. Adiciona marcadores para as escolas
        schools.forEach((school) => {
            // Leaflet usa [latitude, longitude], então invertemos as coordenadas
            const latLng: [number, number] = [school.coordinates[1], school.coordinates[0]];
            
            // Cria um marcador com ícone customizado
            const marker = L.marker(latLng, {
                icon: createCustomIcon(school)
            })
            .addTo(map.current!);

            // Cria o HTML do popup (igual à sua estrutura de Card, mas em string)
            const natureBadge = school.nature === 'Pública' 
                ? '<span style="display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; background: linear-gradient(to right, #fbbf24, #f59e0b); color: white; font-size: 0.75rem; font-weight: 600; border-radius: 9999px; margin-bottom: 0.5rem;">Pública</span>'
                : '<span style="display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; background: linear-gradient(to right, #f97316, #ea580c); color: white; font-size: 0.75rem; font-weight: 600; border-radius: 9999px; margin-bottom: 0.5rem;">Particular</span>';
            
            const popupContent = `
                <div class="p-3 font-montserrat" style="max-width: 280px;">
                    <h3 class="font-poppins font-bold text-lg mb-1" style="color: #000;">${school.name}</h3>
                    ${natureBadge}
                    <p class="text-sm mb-3 flex items-center" style="color: #666;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${school.neighborhood}
                    </p>
                    
                    <div style="background: linear-gradient(to bottom, #fef3c7, #fed7aa); padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 0.75rem;">
                        <div style="font-size: 0.75rem; font-weight: 600; color: #92400e; margin-bottom: 0.25rem;">📚 Períodos:</div>
                        <div style="font-size: 0.75rem; color: #451a03;">
                            ${school.periods.length > 0 ? school.periods.slice(0, 2).join(', ') + (school.periods.length > 2 ? '...' : '') : 'Sem informações'}
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(to bottom, #dbeafe, #bfdbfe); padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 0.75rem;">
                        <div style="font-size: 0.75rem; font-weight: 600; color: #1e3a8a; margin-bottom: 0.25rem;">👨‍🏫 Instrutores:</div>
                        <div style="font-size: 0.75rem; color: #1e40af; max-height: 60px; overflow-y: auto;">
                            ${school.instructors.length > 0 ? school.instructors.slice(0, 2).map(i => `<div>• ${i.name} (${i.subject})</div>`).join('') + (school.instructors.length > 2 ? '<div style="font-style: italic;">...e mais</div>' : '') : 'Sem informações'}
                        </div>
                    </div>
                    
                    <div style="font-size: 0.75rem; color: #666; margin-bottom: 0.75rem; padding: 0.5rem; background: #f9fafb; border-radius: 0.375rem;">
                        <div style="margin-bottom: 0.25rem;">
                            📧 ${school.email ? school.email : 'Sem informações de email'}
                        </div>
                        <div>
                            📞 ${school.phone ? school.phone : 'Sem informações de telefone'}
                        </div>
                    </div>
                    
                    <button id="details-btn-${school.id}" style="width: 100%; padding: 0.625rem; border-radius: 0.5rem; font-family: Poppins, sans-serif; font-weight: 600; background: linear-gradient(to right, #f97316, #fbbf24); color: white; border: none; cursor: pointer; transition: all 0.3s; font-size: 0.875rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 0.375rem; vertical-align: middle;"><path d="M15 3h6v6"></path><path d="M10 14L21 3"></path><path d="M18 19H6c-1.1 0-2-.9-2 2V7c0-1.1.9-2 2-2h5"></path></svg>
                        Ver Detalhes
                    </button>
                </div>
            `;
            
            // 4. Conecta o Popup ao marcador
            marker.bindPopup(popupContent, {
                // Opção para fechar o popup ao clicar em outro
                autoClose: false,
                closeOnClick: false 
            });

            // 5. Adiciona um Listener ao evento de 'click' do marcador
            // Usamos o evento Leaflet, e não o elemento DOM (como no Mapbox)
            marker.on('click', () => {
                 setSelectedPopup(school);
                 onSchoolSelect?.(school);
                 
                 // Adiciona listener ao botão APÓS o popup ser aberto (ou o DOM é criado)
                 // É uma forma menos "React" de fazer, mas funciona com popups do Leaflet
                 setTimeout(() => {
                    const detailButton = document.getElementById(`details-btn-${school.id}`);
                    if (detailButton) {
                        detailButton.onclick = () => handleViewDetails(school.id);
                    }
                 }, 0);
            });
        });

        // Cleanup function
        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, [schools, onSchoolSelect, navigate]);

    // -------------------------------------------------------------------------
    // Funções de Ação (Mantidas as suas funções originais de navegação)
    // -------------------------------------------------------------------------

    // A função de clique no Mock Pin (removeremos o Mock Map)
    // Foi adaptada para o funcionamento do Leaflet, onde o click no Pin abre o popup.
    const handleViewDetails = (schoolId: string) => {
        navigate(`/escola/${schoolId}`);
    };
    
    // A função handleSchoolClick e o estado selectedPopup se tornam menos críticos 
    // para a exibição do popup em si (que é nativa do Leaflet), mas mantemos para 
    // a comunicação com o componente pai (onSchoolSelect).

    // -------------------------------------------------------------------------
    // Renderização (Retirando o Mock Map e mantendo apenas o contêiner do Leaflet)
    // -------------------------------------------------------------------------
    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="font-montserrat text-muted-foreground">Carregando escolas...</p>
            </div>
        );
    }

    const handleSchoolSearch = (school: School) => {
        if (map.current) {
            // Leaflet usa [latitude, longitude]
            const latLng: [number, number] = [school.coordinates[1], school.coordinates[0]];
            map.current.setView(latLng, 16);
        }
        onSchoolSelect?.(school);
        setSelectedPopup(school);
    };

    return (
        <div className="relative w-full h-full">
            {/* Contêiner REAL do Mapa Leaflet */}
            <div 
                ref={mapContainer} 
                id="leaflet-map-container"
                className="w-full h-full relative z-0"
            >
                {/* Aqui será onde o Leaflet injetará o mapa */}
            </div>

            {/* Map Search Bar - No canto direito */}
            <div className="absolute top-4 right-4 z-10">
                <MapSearch 
                    schools={schools}
                    onSchoolSelect={handleSchoolSearch}
                />
            </div>

            {/* Map Controls removed as requested - using native Leaflet controls */}

            {/* OBS: O Card/Popup de React (selectedPopup) foi **removido** pois o Leaflet usa seu próprio Popup de HTML. 
               O código foi movido para o 'popupContent' do marcador no useEffect.
               Manter o Card de React é complexo, pois ele não acompanha o movimento do mapa.
            */}
        </div>
    );
};

export default MapComponent;