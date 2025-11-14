// Add global declaration for jspdf to avoid TypeScript errors.
declare global {
  interface Window {
    jspdf: any;
  }
}

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// --- MOCK DATA ---
const sampleMembers = [
  { id: 1, name: 'Ana', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 2, name: 'Carlos Santos', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
  { id: 3, name: 'Designer User', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
];

const initialClients = [
  { id: 'client-1', name: 'Tech Solutions Inc.', contactPerson: 'John Doe', email: 'john.doe@techsolutions.com', phone: '123-456-7890', logoUrl: 'https://logopond.com/logos/f7c13b1916a9a74360098411b0f19c2f.png' },
  { id: 'client-2', name: 'Creative Minds Agency', contactPerson: 'Jane Smith', email: 'jane.smith@creativeminds.com', phone: '098-765-4321', logoUrl: 'https://logopond.com/logos/2569560f8a8738370786ac38029c9b43.png' },
];

const teamPermissions = [
    { role: 'Owner', description: 'Acesso total ao projeto e configurações', icon: 'crown' },
    { role: 'Designer', description: 'Pode criar e editar projetos e arquivos', icon: 'designer' },
    { role: 'Developer', description: 'Pode visualizar e baixar arquivos', icon: 'developer' },
];


const initialProjects = [
  {
    id: 'proj-1',
    clientId: 'client-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    name: 'Website Redesign',
    description: 'Redesign completo do site corporativo',
    dueDate: '2024-02-14',
    status: 'Em Andamento',
    progress: 65,
    members: [sampleMembers[0], sampleMembers[2]],
    subprojects: [],
    keyVisual: 'https://images.unsplash.com/photo-1559028006-448665bd7c16?q=80&w=2670&auto=format&fit=crop',
    history: [
        { status: 'Planejado', date: new Date(Date.now() - 1000 * 60 * 60 * 72) },
        { status: 'Em Andamento', date: new Date(Date.now() - 1000 * 60 * 60 * 68) },
    ],
    comments: [
        { id: 'c1', author: sampleMembers[0], text: 'Acho que podemos usar uma paleta de cores mais vibrante aqui.', timestamp: new Date(Date.now() - 1000 * 60 * 65) },
        { id: 'c2', author: sampleMembers[2], text: 'Boa ideia! Vou preparar algumas opções com tons de verde e laranja.', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    ]
  },
  {
    id: 'proj-2',
    clientId: 'client-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
    name: 'Mobile App UI',
    description: 'Interface do aplicativo mobile',
    dueDate: '2024-01-29',
    status: 'Aguardando Aprovação',
    progress: 90,
    members: [sampleMembers[2], sampleMembers[1]],
    subprojects: [],
    keyVisual: 'https://images.unsplash.com/photo-1581287053822-fd7bf4f4bf3f?q=80&w=2574&auto=format&fit=crop',
    history: [
        { status: 'Planejado', date: new Date(Date.now() - 1000 * 60 * 60 * 120) },
        { status: 'Em Andamento', date: new Date(Date.now() - 1000 * 60 * 60 * 90) },
        { status: 'Aguardando Aprovação', date: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    ],
    comments: []
  },
    {
    id: 'proj-3',
    clientId: 'client-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 200),
    name: 'Campanha Digital',
    description: 'Campanha digital de promoção sazonal.',
    dueDate: '2025-09-29',
    status: 'Aprovado',
    progress: 100,
    members: [sampleMembers[2]],
    keyVisual: 'https://images.unsplash.com/photo-1620912189875-19db35de9c1b?q=80&w=2664&auto=format&fit=crop',
    history: [
        { status: 'Planejado', date: new Date(Date.now() - 1000 * 60 * 60 * 200) },
        { status: 'Aprovado', date: new Date(Date.now() - 1000 * 60 * 60 * 150) },
    ],
    subprojects: [
        { id: 'sub-1', name: 'Peça 1: Banner Principal', description: 'Banner para a home do site 1200x400' },
        { id: 'sub-2', name: 'Peça 2: Posts para Instagram', description: '3 posts em formato carrossel' },
    ],
    comments: [
         { id: 'c3', author: sampleMembers[1], text: 'O briefing está claro, começando o desenvolvimento das peças.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    ]
  },
];

const initialFiles = [
    { id: 'file-1', projectId: 'proj-1', name: 'Homepage_Design_v2.fig', type: 'application/figma', size: '2.4 MB', uploadedAt: '19/09/2025', content: null },
    { id: 'file-2', projectId: 'proj-1', name: 'Brand_Guidelines.pdf', type: 'application/pdf', size: '1.8 MB', uploadedAt: '19/09/2025', content: null },
    { id: 'file-3', projectId: 'proj-2', name: 'App_Wireframes.sketch', type: 'application/sketch', size: '3.2 MB', uploadedAt: '19/09/2025', content: null },
    { id: 'file-4', projectId: 'proj-3', name: 'briefing_campanha.pdf', type: 'application/pdf', size: '0.8 MB', uploadedAt: '20/09/2025', content: null },
];

const initialClientAssets = [
    { id: 'asset-1', clientId: 'client-1', name: 'TechSolutions_Logo_Primary.svg', type: 'image/svg+xml', size: '15 KB', url: '#', uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48) },
    { id: 'asset-2', clientId: 'client-1', name: 'Manual_de_Marca.pdf', type: 'application/pdf', size: '5.2 MB', url: '#', uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 40) },
    { id: 'asset-3', clientId: 'client-2', name: 'CreativeMinds_Full_Logo.png', type: 'image/png', size: '120 KB', url: '#', uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 150) },
];

const projectStati = ['Em Andamento', 'Aguardando Aprovação', 'Em Alteração', 'Standby', 'Recusado', 'Aprovado'];

const getFileIcon = (type) => {
    if (type.includes('pdf')) return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#F97316'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
    if (type.includes('image') || type.includes('sketch') || type.includes('figma') || type.includes('svg')) return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--primary-end)'}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-secondary)'}}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>;
};

const useStickyState = (defaultValue, key) => {
    const [value, setValue] = useState(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            // A little trick to parse dates correctly from JSON
            const parsedValue = stickyValue !== null ? JSON.parse(stickyValue, (k, v) => {
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v)) {
                    return new Date(v);
                }
                return v;
            }) : defaultValue;
            return parsedValue;
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }, [key, value]);

    return [value, setValue];
};

const App = () => {
    // Global state for all agencies' data
    const [users, setUsers] = useStickyState([], 'users'); // This is the list of agencies
    const [allProjects, setAllProjects] = useStickyState([], 'allProjects');
    const [allFiles, setAllFiles] = useStickyState([], 'allFiles');
    const [allClients, setAllClients] = useStickyState([], 'allClients');
    const [allClientAssets, setAllClientAssets] = useStickyState([], 'allClientAssets');
    const [allTeamMembers, setAllTeamMembers] = useStickyState([], 'allTeamMembers');

    // App-level state
    const [currentUser, setCurrentUser] = useStickyState(null, 'currentUser');
    const [isAdmin, setIsAdmin] = useStickyState(false, 'isAdmin');
    const [activeTab, setActiveTab] = useState('projects');
    
    // Detail/modal states
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isCreateSubprojectModalOpen, setCreateSubprojectModalOpen] = useState(false);
    const [isCreateClientModalOpen, setCreateClientModalOpen] = useState(false);
    const [isRegisterMemberModalOpen, setRegisterMemberModalOpen] = useState(false);
    const [isStatusModalOpen, setStatusModalOpen] = useState(false);
    const [projectToUpdateStatus, setProjectToUpdateStatus] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSidebarOpen(false);
    };

    const handleRegister = ({ agencyName, ownerName, ownerEmail, password }) => {
        if (users.find(u => u.email === ownerEmail)) {
            alert('Este e-mail já está em uso.');
            return;
        }

        const newUser = {
            id: crypto.randomUUID(),
            name: ownerName,
            email: ownerEmail,
            password: password,
            agencyName: agencyName,
        };
        setUsers(prev => [...prev, newUser]);

        const agencyId = newUser.id;
        const owner = {
            id: agencyId,
            agencyId: agencyId,
            name: ownerName,
            email: ownerEmail,
            role: 'Owner',
            avatarUrl: `https://i.pravatar.cc/150?u=${agencyId}`,
            status: 'Online',
            assignedClients: [],
        };
        setAllTeamMembers(prev => [...prev, owner]);

        // If this is the very first registration, populate with sample data for this agency
        if (users.length === 0) {
            const sampleClients = initialClients.map(c => ({ ...c, id: crypto.randomUUID(), agencyId }));
            setAllClients(prev => [...prev, ...sampleClients]);

            const sampleProjects = initialProjects.map(p => {
                const originalClient = initialClients.find(ic => ic.id === p.clientId);
                const newClient = sampleClients.find(sc => sc.name === originalClient.name);
                return { ...p, id: crypto.randomUUID(), agencyId, clientId: newClient?.id };
            });
            setAllProjects(prev => [...prev, ...sampleProjects]);
            
            // Note: files and client assets are not being ported to the new multi-tenant structure in this example for brevity
        }

        setCurrentUser(owner);
    };

    const handleLogin = ({ email, password }) => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            const memberProfile = allTeamMembers.find(m => m.id === user.id);
            if (memberProfile) {
                setCurrentUser(memberProfile);
            } else {
                alert("Perfil de membro não encontrado para este usuário.");
            }
        } else {
            alert('E-mail ou senha inválidos.');
        }
    };

    const handleAdminLogin = () => {
        setIsAdmin(true);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setIsAdmin(false);
    };
    
    const handleCreateProject = (projectData) => {
        const newProject = { 
            id: crypto.randomUUID(), 
            agencyId: currentUser.agencyId,
            ...projectData,
            progress: 0,
            createdAt: new Date(),
            history: [{ status: projectData.status, date: new Date() }],
            members: [currentUser],
            subprojects: [],
            keyVisual: null,
            comments: [],
        };
        setAllProjects(prev => [newProject, ...prev]);
        setCreateModalOpen(false);
    };
    
    const handleCreateClient = (clientData) => {
        const newClient = {
            id: crypto.randomUUID(),
            agencyId: currentUser.agencyId,
            ...clientData
        };
        setAllClients(prev => [newClient, ...prev]);
        setCreateClientModalOpen(false);
    };

    const handleCreateSubproject = (subprojectData) => {
        if (!selectedProject) return;
        const newSubproject = {
            id: crypto.randomUUID(),
            ...subprojectData
        };
        
        const updatedProjects = allProjects.map(p => {
            if (p.id === selectedProject.id) {
                const updatedSubprojects = [...(p.subprojects || []), newSubproject];
                return { ...p, subprojects: updatedSubprojects };
            }
            return p;
        });

        setAllProjects(updatedProjects);
        setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id));
        setCreateSubprojectModalOpen(false);
    };

    const handleDeleteProject = (e, projectId) => {
        e.stopPropagation();
        if (!window.confirm("Tem certeza que deseja excluir este projeto?")) return;
        setAllProjects(prev => prev.filter(p => p.id !== projectId));
        // setAllFiles(prev => prev.filter(f => f.projectId !== projectId));
    };
    
    const handleDeleteSubproject = (subprojectId) => {
        if (!selectedProject) return;
        
        const updatedProjects = allProjects.map(p => {
            if (p.id === selectedProject.id) {
                const updatedSubprojects = p.subprojects.filter(sp => sp.id !== subprojectId);
                return { ...p, subprojects: updatedSubprojects };
            }
            return p;
        });

        setAllProjects(updatedProjects);
        setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id));
    };

    const handleKeyVisualUpload = (event) => {
        const file = event.target.files[0];
        if (!file || !selectedProject) return;

        const reader = new FileReader();
        reader.onload = (e) => {
             const updatedProjects = allProjects.map(p => {
                if (p.id === selectedProject.id) {
                    return { ...p, keyVisual: e.target.result };
                }
                return p;
            });
            setAllProjects(updatedProjects);
            setSelectedProject(prev => ({...prev, keyVisual: e.target.result}));
        };
        reader.readAsDataURL(file);
        event.target.value = null;
    };

    const handlePostComment = (projectId, commentText) => {
        if (!currentUser) return;

        const newComment = {
            id: crypto.randomUUID(),
            author: currentUser,
            text: commentText,
            timestamp: new Date(),
        };

        const updatedProjects = allProjects.map(p => {
            if (p.id === projectId) {
                return { ...p, comments: [...p.comments, newComment] };
            }
            return p;
        });

        setAllProjects(updatedProjects);
        setSelectedProject(prev => ({...prev, comments: [...prev.comments, newComment]}));
    };

    const handleRegisterMember = (memberData) => {
        const newMember = {
            id: crypto.randomUUID(),
            agencyId: currentUser.agencyId,
            avatarUrl: `https://i.pravatar.cc/150?u=${crypto.randomUUID()}`,
            status: 'Offline',
            assignedClients: [],
            ...memberData,
        };
        setAllTeamMembers(prev => [...prev, newMember]);
        setRegisterMemberModalOpen(false);
    };
    
    const handleUpdateMemberProfile = (memberId, updatedData) => {
        const updatedMembers = allTeamMembers.map(m =>
            m.id === memberId ? { ...m, ...updatedData } : m
        );
        setAllTeamMembers(updatedMembers);
        setSelectedMember(updatedMembers.find(m => m.id === memberId));
    };
    
    const handleMemberAvatarUpload = (memberId, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            handleUpdateMemberProfile(memberId, { avatarUrl: e.target.result as string });
        };
        reader.readAsDataURL(file);
    };

    const handleOpenStatusModal = (project) => {
        setProjectToUpdateStatus(project);
        setStatusModalOpen(true);
    };

    const handleUpdateProjectStatus = (projectId, newStatus) => {
        setAllProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === projectId ? { ...p, status: newStatus, history: [...(p.history || []), { status: newStatus, date: new Date() }] } : p
            )
        );
        setStatusModalOpen(false);
        setProjectToUpdateStatus(null);
    };
    
    const handleProjectSelect = (project) => {
        setActiveTab('projects-detail');
        setSelectedProject(project);
    };

    const handleClientLogoUpload = (clientId, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const updatedClients = allClients.map(c =>
                c.id === clientId ? { ...c, logoUrl: e.target.result as string } : c
            );
            setAllClients(updatedClients);
            if (selectedClient?.id === clientId) {
                setSelectedClient(updatedClients.find(c => c.id === clientId));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleClientAssetUpload = (clientId, file) => {
        if (!file) return;
        const newAsset = {
            id: crypto.randomUUID(),
            agencyId: currentUser.agencyId,
            clientId: clientId,
            name: file.name,
            type: file.type,
            size: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`,
            url: URL.createObjectURL(file),
            uploadedAt: new Date(),
        };
        setAllClientAssets(prev => [newAsset, ...prev].sort((a,b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()));
    };

    const handleExportCasePDF = async (project) => {
        if (!window.jspdf) {
            alert("Biblioteca PDF não carregada. Por favor, tente novamente.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        
        const agencyName = users.find(u => u.id === project.agencyId)?.agencyName || "Manda Hub";
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
    
        const addPageWithFooter = () => {
            doc.addPage();
            addFooter();
        };

        const addFooter = () => {
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setTextColor(150);
                doc.text( `Case exportado por ${agencyName}`, margin, pageHeight - 10 );
                doc.text( `Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' } );
            }
        };

        let y = margin;
        const addText = (text, size, isBold, yPos) => {
            if (yPos > pageHeight - margin - 20) { addPageWithFooter(); yPos = margin; }
            doc.setFontSize(size);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
            doc.text(lines, margin, yPos);
            return yPos + (lines.length * (size * 0.35)) + 5;
        };
    
        y = addText(project.name, 22, true, y);
        const client = allClients.find(c => c.id === project.clientId);
        if (client) { y = addText(`Cliente: ${client.name}`, 12, false, y); }
        y += 5;
    
        if (project.keyVisual) {
            y = addText('Key Visual', 16, true, y);
            try {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = project.keyVisual;
                await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
                
                const imgProps = doc.getImageProperties(img);
                const aspect = imgProps.width / imgProps.height;
                let imgWidth = pageWidth - margin * 2;
                let imgHeight = imgWidth / aspect;
    
                if (y + imgHeight > pageHeight - margin) { addPageWithFooter(); y = margin; }
    
                doc.addImage(img, 'JPEG', margin, y, imgWidth, imgHeight);
                y += imgHeight + 10;
            } catch (error) {
                console.error("Error adding image to PDF:", error);
                y = addText('Não foi possível carregar a imagem.', 10, false, y);
            }
        }
    
        if (project.subprojects && project.subprojects.length > 0) {
            if (y > pageHeight - margin - 20) { addPageWithFooter(); y = margin; }
            y = addText('Subprojetos / Desdobramentos', 18, true, y);
    
            project.subprojects.forEach(sp => {
                if (y > pageHeight - margin - 20) { addPageWithFooter(); y = margin; }
                y = addText(sp.name, 14, true, y);
                y = addText(sp.description, 11, false, y);
                y += 5;
            });
        }
        
        addFooter();
        doc.save(`Case_${project.name.replace(/\s/g, '_')}.pdf`);
    };
    
    const handleDeleteUser = (userId) => {
        if (window.confirm("Tem certeza que deseja excluir esta agência e TODOS os seus dados (projetos, clientes, membros)? Esta ação é irreversível.")) {
            setAllProjects(prev => prev.filter(p => p.agencyId !== userId));
            setAllClients(prev => prev.filter(c => c.agencyId !== userId));
            setAllTeamMembers(prev => prev.filter(m => m.agencyId !== userId));
            setAllFiles(prev => prev.filter(f => f.agencyId !== userId));
            setAllClientAssets(prev => prev.filter(a => a.agencyId !== userId));
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };
    
    // --- Admin Delete Handlers ---
    const handleAdminDeleteProject = (projectId) => {
        if (window.confirm("Admin: Tem certeza de que deseja excluir este projeto?")) {
            setAllProjects(prev => prev.filter(p => p.id !== projectId));
        }
    };
    const handleAdminDeleteClient = (clientId) => {
        if (window.confirm("Admin: Tem certeza de que deseja excluir este cliente e TODOS os seus projetos associados?")) {
            setAllProjects(prev => prev.filter(p => p.clientId !== clientId));
            setAllClients(prev => prev.filter(c => c.id !== clientId));
        }
    };
    const handleAdminDeleteMember = (memberId) => {
        const member = allTeamMembers.find(m => m.id === memberId);
        if (member?.role === 'Owner') {
            alert("Não é possível excluir o Dono de uma agência. Exclua a agência inteira.");
            return;
        }
        if (window.confirm("Admin: Tem certeza de que deseja excluir este membro?")) {
            setAllTeamMembers(prev => prev.filter(m => m.id !== memberId));
        }
    };


    useEffect(() => {
        if(activeTab !== 'projects-detail') setSelectedProject(null);
        if(activeTab !== 'clients') setSelectedClient(null);
        if(activeTab !== 'team') setSelectedMember(null);
    }, [activeTab]);

    if (isAdmin) {
        return <AdminDashboard 
            users={users} 
            allProjects={allProjects}
            allClients={allClients}
            allTeamMembers={allTeamMembers}
            onLogout={handleLogout} 
            onDeleteUser={handleDeleteUser}
            onDeleteProject={handleAdminDeleteProject}
            onDeleteClient={handleAdminDeleteClient}
            onDeleteMember={handleAdminDeleteMember}
        />;
    }

    if (!currentUser) {
        return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} onAdminLogin={handleAdminLogin} usersExist={users.length > 0} />;
    }

    // Filter data for the current user's agency
    const agencyId = currentUser.agencyId;
    const agency = users.find(u => u.id === agencyId);
    const agencyName = agency?.agencyName || 'Manda Hub';
    
    const projects = allProjects.filter(p => p.agencyId === agencyId);
    const clients = allClients.filter(c => c.agencyId === agencyId);
    const teamMembers = allTeamMembers.filter(m => m.agencyId === agencyId);
    const files = allFiles.filter(f => f.agencyId === agencyId);
    const clientAssets = allClientAssets.filter(a => a.agencyId === agencyId);

    return (
      <>
        <Style />
        <div className="app-container">
            <Header agencyName={agencyName} currentUser={currentUser} onLogout={handleLogout} onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
            <main className="main-content">
              <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)}></div>
              <Sidebar activeTab={activeTab} onTabChange={handleTabChange} isOpen={isSidebarOpen} />
              <div className="content-panel">
                {activeTab === 'projects' && (
                  <ProjectsFeedView 
                    projects={projects}
                    onProjectSelect={handleProjectSelect}
                  />
                )}
                {activeTab === 'projects-detail' && selectedProject && (
                    <ProjectDetailView
                        project={selectedProject}
                        onBack={() => setActiveTab('projects')}
                        onAddSubproject={() => setCreateSubprojectModalOpen(true)}
                        onDeleteSubproject={handleDeleteSubproject}
                        onKeyVisualUpload={handleKeyVisualUpload}
                        onPostComment={handlePostComment}
                    />
                )}
                {activeTab === 'clients' && !selectedClient && (
                    <ClientsView 
                        clients={clients} 
                        onClientSelect={setSelectedClient} 
                        onCreateClient={() => setCreateClientModalOpen(true)}
                    />
                )}
                {activeTab === 'clients' && selectedClient && (
                    <ClientDetailView
                        client={selectedClient}
                        projects={projects.filter(p => p.clientId === selectedClient.id)}
                        files={files}
                        onBack={() => setSelectedClient(null)}
                        onProjectSelect={handleProjectSelect}
                        onDeleteProject={handleDeleteProject}
                        onOpenStatusModal={handleOpenStatusModal}
                        onCreateProject={() => setCreateModalOpen(true)}
                        clientAssets={clientAssets.filter(a => a.clientId === selectedClient.id)}
                        onLogoUpload={handleClientLogoUpload}
                        onAssetUpload={handleClientAssetUpload}
                    />
                )}
                {activeTab === 'cases' && (
                    <CasesView 
                        projects={projects} 
                        clients={clients}
                        onExportCase={handleExportCasePDF}
                    />
                )}
                 {activeTab === 'team' && !selectedMember && (
                   <TeamView 
                     members={teamMembers} 
                     permissions={teamPermissions} 
                     onRegisterClick={() => setRegisterMemberModalOpen(true)}
                     onMemberSelect={setSelectedMember}
                    />
                )}
                {activeTab === 'team' && selectedMember && (
                    <TeamMemberProfileView
                        member={selectedMember}
                        clients={clients}
                        onBack={() => setSelectedMember(null)}
                        onUpdateProfile={handleUpdateMemberProfile}
                        onAvatarUpload={handleMemberAvatarUpload}
                    />
                )}
              </div>
            </main>
            {isCreateModalOpen && <CreateProjectModal clients={clients} onCreateProject={handleCreateProject} onClose={() => setCreateModalOpen(false)} />}
            {isCreateClientModalOpen && <CreateClientModal onCreateClient={handleCreateClient} onClose={() => setCreateClientModalOpen(false)} />}
            {isCreateSubprojectModalOpen && <CreateSubprojectModal onCreateSubproject={handleCreateSubproject} onClose={() => setCreateSubprojectModalOpen(false)} />}
            {isRegisterMemberModalOpen && <RegisterMemberModal onRegisterMember={handleRegisterMember} onClose={() => setRegisterMemberModalOpen(false)} />}
            {isStatusModalOpen && projectToUpdateStatus && (
                <UpdateStatusModal
                    project={projectToUpdateStatus}
                    stati={projectStati}
                    onUpdateStatus={handleUpdateProjectStatus}
                    onClose={() => setStatusModalOpen(false)}
                />
            )}
        </div>
      </>
    );
};

// --- SUB-COMPONENTS (VIEWS, MODALS, ETC.) ---

const AdminDashboard = ({ users, allProjects, allClients, allTeamMembers, onLogout, onDeleteUser, onDeleteProject, onDeleteClient, onDeleteMember }) => {
    const [activeTab, setActiveTab] = useState('agencies');
    
    const getAgencyName = useCallback((agencyId) => {
        return users.find(u => u.id === agencyId)?.agencyName || 'N/A';
    }, [users]);

    const getClientName = useCallback((clientId) => {
        return allClients.find(c => c.id === clientId)?.name || 'N/A';
    }, [allClients]);
    
    return (
        <>
            <div className="admin-dashboard">
                <header className="admin-header">
                    <div className="logo-section">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="4" ry="4" fill="var(--primary-end)" />
                            <path d="M7 15.5V9.5C7 8.11929 8.11929 7 9.5 7H14.5C15.8807 7 17 8.11929 17 9.5V11.5M12 11.5L17 16.5M12 11.5L7 16.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h1>Manda Hub - Admin</h1>
                    </div>
                    <button onClick={onLogout} className="btn-secondary">Sair</button>
                </header>
                <div className="admin-content">
                    <nav className="admin-nav">
                        <button onClick={() => setActiveTab('agencies')} className={activeTab === 'agencies' ? 'active' : ''}>Agências ({users.length})</button>
                        <button onClick={() => setActiveTab('projects')} className={activeTab === 'projects' ? 'active' : ''}>Projetos ({allProjects.length})</button>
                        <button onClick={() => setActiveTab('clients')} className={activeTab === 'clients' ? 'active' : ''}>Clientes ({allClients.length})</button>
                        <button onClick={() => setActiveTab('members')} className={activeTab === 'members' ? 'active' : ''}>Membros ({allTeamMembers.length})</button>
                    </nav>
                    <div className="admin-table-container">
                        {activeTab === 'agencies' && (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nome da Agência</th>
                                        <th>Dono</th>
                                        <th>Email</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.agencyName}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <button onClick={() => onDeleteUser(user.id)} className="btn-delete">Excluir</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                         {activeTab === 'projects' && (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nome do Projeto</th>
                                        <th>Agência</th>
                                        <th>Cliente</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allProjects.map(project => (
                                        <tr key={project.id}>
                                            <td>{project.name}</td>
                                            <td>{getAgencyName(project.agencyId)}</td>
                                            <td>{getClientName(project.clientId)}</td>
                                            <td><span className={`status-badge status-${project.status?.replace(/\s+/g, '-').toLowerCase()}`}>{project.status}</span></td>
                                            <td><button onClick={() => onDeleteProject(project.id)} className="btn-delete">Excluir</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                         {activeTab === 'clients' && (
                             <table>
                                <thead>
                                    <tr>
                                        <th>Nome do Cliente</th>
                                        <th>Agência</th>
                                        <th>Contato</th>
                                        <th>Email</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allClients.map(client => (
                                        <tr key={client.id}>
                                            <td>{client.name}</td>
                                            <td>{getAgencyName(client.agencyId)}</td>
                                            <td>{client.contactPerson}</td>
                                            <td>{client.email}</td>
                                            <td><button onClick={() => onDeleteClient(client.id)} className="btn-delete">Excluir</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'members' && (
                             <table>
                                <thead>
                                    <tr>
                                        <th>Nome do Membro</th>
                                        <th>Agência</th>
                                        <th>Email</th>
                                        <th>Cargo</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allTeamMembers.map(member => (
                                        <tr key={member.id}>
                                            <td>{member.name}</td>
                                            <td>{getAgencyName(member.agencyId)}</td>
                                            <td>{member.email}</td>
                                            <td>{member.role}</td>
                                            <td><button onClick={() => onDeleteMember(member.id)} className="btn-delete">Excluir</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};


const AuthScreen = ({ onLogin, onRegister, onAdminLogin, usersExist }) => {
    const [isLogin, setIsLogin] = useState(usersExist);
    const [formData, setFormData] = useState({ email: '', password: '', agencyName: '', ownerName: '', ownerEmail: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            onLogin({ email: formData.email, password: formData.password });
        } else {
            onRegister({
                agencyName: formData.agencyName,
                ownerName: formData.ownerName,
                ownerEmail: formData.ownerEmail,
                password: formData.password
            });
        }
    };
    
    useEffect(() => {
        setIsLogin(usersExist);
    }, [usersExist]);

    return (
        <>
            <Style />
            <div className="auth-container">
                <div className="auth-panel">
                    <div className="auth-logo">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <rect x="3" y="3" width="18" height="18" rx="4" ry="4" fill="var(--primary-end)" />
                            <path d="M7 15.5V9.5C7 8.11929 8.11929 7 9.5 7H14.5C15.8807 7 17 8.11929 17 9.5V11.5M12 11.5L17 16.5M12 11.5L7 16.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h1>Manda Hub</h1>
                    </div>
                    <h2>{isLogin ? 'Bem-vindo de volta!' : 'Crie sua agência'}</h2>
                    <p>{isLogin ? 'Faça login para gerenciar seus projetos.' : 'Comece a organizar seus projetos e clientes.'}</p>
                    <form onSubmit={handleSubmit}>
                        {isLogin ? (
                            <>
                                <input type="email" name="email" placeholder="Email" required onChange={handleInputChange} value={formData.email} />
                                <input type="password" name="password" placeholder="Senha" required onChange={handleInputChange} value={formData.password} />
                            </>
                        ) : (
                            <>
                                <input type="text" name="agencyName" placeholder="Nome da sua Agência" required onChange={handleInputChange} value={formData.agencyName} />
                                <input type="text" name="ownerName" placeholder="Seu nome" required onChange={handleInputChange} value={formData.ownerName} />
                                <input type="email" name="ownerEmail" placeholder="Seu email (será seu login)" required onChange={handleInputChange} value={formData.ownerEmail} />
                                <input type="password" name="password" placeholder="Crie uma senha" required onChange={handleInputChange} value={formData.password} />
                            </>
                        )}
                        <button type="submit" className="btn-primary">{isLogin ? 'Entrar' : 'Criar Conta'}</button>
                    </form>
                    <p className="auth-toggle">
                        {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        <button onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Cadastre-se' : 'Faça login'}</button>
                    </p>
                </div>
                <div className="auth-footer">
                    <button onClick={onAdminLogin}>Acesso Administrativo</button>
                </div>
            </div>
        </>
    );
};

const Header = ({ agencyName, currentUser, onLogout, onToggleSidebar }) => {
    return (
        <header className="header">
            <div className="header-left">
                <button className="sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="logo-section">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="4" ry="4" fill="var(--primary-end)" />
                        <path d="M7 15.5V9.5C7 8.11929 8.11929 7 9.5 7H14.5C15.8807 7 17 8.11929 17 9.5V11.5M12 11.5L17 16.5M12 11.5L7 16.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h1>{agencyName}</h1>
                </div>
            </div>
            <div className="header-right">
                <div className="user-profile">
                    <img src={currentUser.avatarUrl} alt={currentUser.name} />
                    <div className="user-info">
                        <span>{currentUser.name}</span>
                        <small>{currentUser.role}</small>
                    </div>
                </div>
                <button onClick={onLogout} className="btn-logout" aria-label="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
            </div>
        </header>
    );
};

const Sidebar = ({ activeTab, onTabChange, isOpen }) => {
  const tabs = [
    { id: 'projects', label: 'Projetos', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
    { id: 'clients', label: 'Clientes', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { id: 'cases', label: 'Cases', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> },
    { id: 'team', label: 'Equipe', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> },
  ];
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id || (activeTab === 'projects-detail' && tab.id === 'projects') ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};


const ProjectsFeedView = ({ projects, onProjectSelect }) => {
    return (
        <div className="view-container">
            <div className="view-header">
                <h2>Todos os Projetos ({projects.length})</h2>
            </div>
            <div className="projects-grid">
                {projects.map(project => (
                    <div key={project.id} className="project-card" onClick={() => onProjectSelect(project)}>
                        <div className="project-card-image" style={{backgroundImage: `url(${project.keyVisual || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2670&auto=format&fit=crop'})`}}></div>
                        <div className="project-card-content">
                             <span className={`status-badge status-${project.status.replace(/\s+/g, '-').toLowerCase()}`}>{project.status}</span>
                            <h3>{project.name}</h3>
                            <p>{project.description}</p>
                            <div className="progress-bar">
                                <div className="progress-bar-fill" style={{ width: `${project.progress}%` }}></div>
                            </div>
                            <div className="project-card-footer">
                                <div className="members-avatars">
                                    {project.members.slice(0, 3).map(member => (
                                        <img key={member.id} src={member.avatarUrl} alt={member.name} title={member.name} />
                                    ))}
                                    {project.members.length > 3 && <div className="avatar-more">+{project.members.length - 3}</div>}
                                </div>
                                <span className="due-date">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    {new Date(project.dueDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProjectDetailView = ({ project, onBack, onAddSubproject, onDeleteSubproject, onKeyVisualUpload, onPostComment }) => {
    const fileInputRef = useRef(null);
    const commentInputRef = useRef(null);
    
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        const commentText = commentInputRef.current.value.trim();
        if (commentText) {
            onPostComment(project.id, commentText);
            commentInputRef.current.value = '';
        }
    };
    
    return (
        <div className="project-detail-view">
             <button onClick={onBack} className="back-button">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Voltar
            </button>
            <div className="detail-header" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${project.keyVisual})`}}>
                <h1>{project.name}</h1>
                 <span className={`status-badge status-${project.status.replace(/\s+/g, '-').toLowerCase()}`}>{project.status}</span>
                 <input type="file" ref={fileInputRef} onChange={onKeyVisualUpload} style={{ display: 'none' }} accept="image/*"/>
                 <button className="btn-secondary upload-kv" onClick={() => fileInputRef.current?.click()}>Alterar Key Visual</button>
            </div>
            <div className="detail-content-grid">
                <div className="main-content-column">
                    <div className="card">
                        <h3>Subprojetos / Peças</h3>
                        <ul className="subproject-list">
                        {project.subprojects?.map(sp => (
                            <li key={sp.id}>
                                <div>
                                    <strong>{sp.name}</strong>
                                    <p>{sp.description}</p>
                                </div>
                                <button onClick={() => onDeleteSubproject(sp.id)} className="btn-delete-subproject">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </li>
                        ))}
                        </ul>
                        <button onClick={onAddSubproject} className="btn-primary">+ Adicionar Peça</button>
                    </div>
                     <div className="card">
                        <h3>Comentários</h3>
                        <div className="comments-list">
                            {project.comments?.map(comment => (
                                <div key={comment.id} className="comment-item">
                                    <img src={comment.author.avatarUrl} alt={comment.author.name} />
                                    <div className="comment-content">
                                        <strong>{comment.author.name}</strong>
                                        <p>{comment.text}</p>
                                        <small>{new Date(comment.timestamp).toLocaleString()}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleCommentSubmit} className="comment-form">
                            <input ref={commentInputRef} type="text" placeholder="Adicione um comentário..." required />
                            <button type="submit" className="btn-primary">Enviar</button>
                        </form>
                    </div>
                </div>
                <div className="sidebar-column">
                    <div className="card">
                        <h3>Detalhes</h3>
                        <p><strong>Prazo:</strong> {new Date(project.dueDate).toLocaleDateString()}</p>
                        <p><strong>Criado em:</strong> {new Date(project.createdAt).toLocaleDateString()}</p>
                        <p><strong>Progresso:</strong> {project.progress}%</p>
                        <div className="progress-bar">
                             <div className="progress-bar-fill" style={{ width: `${project.progress}%` }}></div>
                        </div>
                    </div>
                    <div className="card">
                        <h3>Equipe</h3>
                        <ul className="team-list">
                            {project.members?.map(member => (
                                <li key={member.id}>
                                    <img src={member.avatarUrl} alt={member.name} />
                                    <span>{member.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="card">
                        <h3>Histórico de Status</h3>
                        <ul className="history-list">
                            {project.history?.map((h, index) => (
                                <li key={index}>
                                    <span className={`status-dot status-${h.status.replace(/\s+/g, '-').toLowerCase()}`}></span>
                                    <div>
                                        <strong>{h.status}</strong>
                                        <small>{new Date(h.date).toLocaleString()}</small>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClientsView = ({ clients, onClientSelect, onCreateClient }) => {
    return (
        <div className="view-container">
            <div className="view-header">
                <h2>Clientes ({clients.length})</h2>
                <button className="btn-primary" onClick={onCreateClient}>+ Novo Cliente</button>
            </div>
            <div className="clients-grid">
                {clients.map(client => (
                    <div key={client.id} className="client-card" onClick={() => onClientSelect(client)}>
                        <img src={client.logoUrl} alt={`${client.name} logo`} className="client-logo" />
                        <h3>{client.name}</h3>
                        <p>{client.contactPerson}</p>
                        <small>{client.email}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ClientDetailView = ({ client, projects, files, onBack, onProjectSelect, onDeleteProject, onOpenStatusModal, onCreateProject, clientAssets, onLogoUpload, onAssetUpload }) => {
    const logoInputRef = useRef(null);
    const assetInputRef = useRef(null);

    return (
        <div className="view-container">
             <button onClick={onBack} className="back-button">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Voltar
            </button>
            <div className="client-detail-header">
                <div className="client-logo-container">
                    <img src={client.logoUrl} alt={`${client.name} logo`} className="client-detail-logo" />
                    <input type="file" ref={logoInputRef} onChange={(e) => onLogoUpload(client.id, e.target.files?.[0])} style={{display: 'none'}} accept="image/*" />
                    <button className="upload-logo-btn" onClick={() => logoInputRef.current?.click()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    </button>
                </div>
                <div>
                    <h2>{client.name}</h2>
                    <p><strong>Contato:</strong> {client.contactPerson}</p>
                    <p><strong>Email:</strong> {client.email}</p>
                    <p><strong>Telefone:</strong> {client.phone}</p>
                </div>
            </div>
            <div className="client-detail-content">
                <div className="card">
                    <div className="card-header">
                        <h3>Projetos Ativos ({projects.length})</h3>
                        <button onClick={onCreateProject} className="btn-primary">+ Novo Projeto</button>
                    </div>
                    <ul className="project-list-compact">
                       {projects.map(project => (
                           <li key={project.id}>
                               <div className="project-info" onClick={() => onProjectSelect(project)}>
                                   <strong>{project.name}</strong>
                                   <p>{project.description}</p>
                               </div>
                               <div className="project-status">
                                   <span className={`status-badge status-${project.status.replace(/\s+/g, '-').toLowerCase()}`}>{project.status}</span>
                                    <button onClick={() => onOpenStatusModal(project)} className="btn-edit-status">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                                    </button>
                               </div>
                               <div className="project-actions">
                                   <button onClick={(e) => onDeleteProject(e, project.id)} className="btn-delete">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                   </button>
                               </div>
                           </li>
                       ))}
                    </ul>
                </div>

                 <div className="card">
                    <div className="card-header">
                        <h3>Ativos do Cliente</h3>
                         <input type="file" ref={assetInputRef} onChange={(e) => onAssetUpload(client.id, e.target.files?.[0])} style={{display: 'none'}} />
                         <button onClick={() => assetInputRef.current?.click()} className="btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            Upload
                        </button>
                    </div>
                     <table className="files-table">
                        <thead>
                            <tr>
                                <th>Nome do Arquivo</th>
                                <th>Tipo</th>
                                <th>Tamanho</th>
                                <th>Data de Upload</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientAssets.map(asset => (
                                <tr key={asset.id}>
                                    <td><div className="file-name-cell">{getFileIcon(asset.type)} <a href={asset.url} target="_blank" rel="noopener noreferrer">{asset.name}</a></div></td>
                                    <td>{asset.type}</td>
                                    <td>{asset.size}</td>
                                    <td>{new Date(asset.uploadedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const CasesView = ({ projects, clients, onExportCase }) => {
    const approvedProjects = projects.filter(p => p.status === 'Aprovado');

    const getClient = (clientId) => clients.find(c => c.id === clientId);

    return (
        <div className="view-container">
            <div className="view-header">
                <h2>Cases de Sucesso ({approvedProjects.length})</h2>
                <p>Aqui estão os projetos aprovados, prontos para serem apresentados.</p>
            </div>
            <div className="cases-grid">
                {approvedProjects.map(project => {
                    const client = getClient(project.clientId);
                    return (
                        <div key={project.id} className="case-card">
                            <div className="case-card-image" style={{ backgroundImage: `url(${project.keyVisual})` }}></div>
                            <div className="case-card-content">
                                <h3>{project.name}</h3>
                                {client && <p className="client-name">{client.name}</p>}
                                <button onClick={() => onExportCase(project)} className="btn-secondary">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    Exportar PDF
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const TeamView = ({ members, permissions, onRegisterClick, onMemberSelect }) => {
    return (
        <div className="view-container">
            <div className="view-header">
                <h2>Equipe ({members.length})</h2>
                <button className="btn-primary" onClick={onRegisterClick}>+ Cadastrar Membro</button>
            </div>
            <div className="team-grid">
                {members.map(member => (
                    <div key={member.id} className="member-card" onClick={() => onMemberSelect(member)}>
                        <div className={`status-indicator ${member.status.toLowerCase()}`}></div>
                        <img src={member.avatarUrl} alt={member.name} />
                        <h3>{member.name}</h3>
                        <p>{member.role}</p>
                    </div>
                ))}
            </div>
            <div className="card permissions-card">
                <h3>Permissões de Equipe</h3>
                <ul>
                    {permissions.map(p => (
                        <li key={p.role}>
                            <strong>{p.role}</strong>
                            <p>{p.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const TeamMemberProfileView = ({ member, clients, onBack, onUpdateProfile, onAvatarUpload }) => {
    const avatarInputRef = useRef(null);
    const [editData, setEditData] = useState({ name: member.name, role: member.role, email: member.email, assignedClients: member.assignedClients || [] });
    
    const handleInputChange = (e) => {
        setEditData({...editData, [e.target.name]: e.target.value });
    };

    const handleClientToggle = (clientId) => {
        const assignedClients = editData.assignedClients.includes(clientId)
            ? editData.assignedClients.filter(id => id !== clientId)
            : [...editData.assignedClients, clientId];
        setEditData({...editData, assignedClients });
    };

    const handleSave = () => {
        onUpdateProfile(member.id, editData);
        alert('Perfil atualizado!');
    };
    
    return (
        <div className="view-container">
            <button onClick={onBack} className="back-button">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Voltar
            </button>
            <div className="profile-view">
                <div className="profile-sidebar">
                    <div className="profile-avatar-container">
                        <img src={member.avatarUrl} alt={member.name} />
                        <input type="file" ref={avatarInputRef} onChange={(e) => onAvatarUpload(member.id, e.target.files?.[0])} accept="image/*" style={{display: 'none'}} />
                        <button className="upload-avatar-btn" onClick={() => avatarInputRef.current?.click()}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                    </div>
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                    <button className="btn-primary" onClick={handleSave}>Salvar Alterações</button>
                </div>
                <div className="profile-main">
                    <div className="card">
                        <h3>Informações do Perfil</h3>
                        <div className="form-group">
                            <label>Nome Completo</label>
                            <input type="text" name="name" value={editData.name} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={editData.email} onChange={handleInputChange} disabled={member.role === 'Owner'}/>
                        </div>
                        <div className="form-group">
                            <label>Cargo</label>
                            <select name="role" value={editData.role} onChange={handleInputChange} disabled={member.role === 'Owner'}>
                                <option>Designer</option>
                                <option>Developer</option>
                                <option>Manager</option>
                                <option>Owner</option>
                            </select>
                        </div>
                    </div>
                     <div className="card">
                        <h3>Clientes Designados</h3>
                        <div className="client-assignment-list">
                            {clients.map(client => (
                                <div key={client.id} className="checkbox-item">
                                    <input 
                                        type="checkbox" 
                                        id={`client-${client.id}`} 
                                        checked={editData.assignedClients.includes(client.id)}
                                        onChange={() => handleClientToggle(client.id)}
                                    />
                                    <label htmlFor={`client-${client.id}`}>{client.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MODALS ---

const CreateProjectModal = ({ clients, onCreateProject, onClose }) => {
    const [formData, setFormData] = useState({ name: '', description: '', clientId: '', dueDate: '', status: 'Planejado' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateProject(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Criar Novo Projeto</h2>
                <form onSubmit={handleSubmit}>
                    <input name="name" placeholder="Nome do Projeto" required onChange={handleChange} />
                    <textarea name="description" placeholder="Descrição" required onChange={handleChange}></textarea>
                    <select name="clientId" required onChange={handleChange} value={formData.clientId}>
                        <option value="" disabled>Selecione um Cliente</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="date" name="dueDate" placeholder="Data de Entrega" required onChange={handleChange} />
                     <select name="status" required onChange={handleChange} value={formData.status}>
                        <option>Planejado</option>
                        <option>Em Andamento</option>
                    </select>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary">Criar Projeto</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CreateClientModal = ({ onCreateClient, onClose }) => {
     const [formData, setFormData] = useState({ name: '', contactPerson: '', email: '', phone: '', logoUrl: 'https://cdn-icons-png.flaticon.com/512/3773/3773223.png' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateClient(formData);
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Cadastrar Novo Cliente</h2>
                <form onSubmit={handleSubmit}>
                    <input name="name" placeholder="Nome do Cliente" required onChange={handleChange} />
                    <input name="contactPerson" placeholder="Nome do Contato" required onChange={handleChange} />
                    <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
                    <input name="phone" placeholder="Telefone" required onChange={handleChange} />
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary">Cadastrar Cliente</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CreateSubprojectModal = ({ onCreateSubproject, onClose }) => {
    const [formData, setFormData] = useState({ name: '', description: '' });
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateSubproject(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Adicionar Peça / Subprojeto</h2>
                <form onSubmit={handleSubmit}>
                    <input name="name" placeholder="Nome da Peça (ex: Post para Instagram)" required onChange={handleChange} />
                    <textarea name="description" placeholder="Descrição (ex: Formato 1080x1080px)" required onChange={handleChange}></textarea>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary">Adicionar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RegisterMemberModal = ({ onRegisterMember, onClose }) => {
    const [formData, setFormData] = useState({ name: '', email: '', role: 'Designer' });
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onRegisterMember(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Cadastrar Novo Membro</h2>
                <form onSubmit={handleSubmit}>
                    <input name="name" placeholder="Nome completo" required onChange={handleChange} />
                    <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="Designer">Designer</option>
                        <option value="Developer">Developer</option>
                        <option value="Manager">Manager</option>
                    </select>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary">Cadastrar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UpdateStatusModal = ({ project, stati, onUpdateStatus, onClose }) => {
    const [newStatus, setNewStatus] = useState(project.status);
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Alterar Status de "{project.name}"</h2>
                <div className="status-options">
                    {stati.map(status => (
                        <button 
                            key={status} 
                            className={`status-option ${newStatus === status ? 'selected' : ''}`}
                            onClick={() => setNewStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                    <button type="button" className="btn-primary" onClick={() => onUpdateStatus(project.id, newStatus)}>Salvar</button>
                </div>
            </div>
        </div>
    );
};


// --- GLOBAL STYLES ---

const Style = () => (
    <style>{`
    :root {
      --primary-start: #6D28D9;
      --primary-end: #4F46E5;
      --secondary: #10B981;
      --background-light: #F9FAFB;
      --background-dark: #111827;
      --card-bg-light: #FFFFFF;
      --card-bg-dark: #1F2937;
      --text-primary-light: #1F2937;
      --text-primary-dark: #F9FAFB;
      --text-secondary-light: #6B7280;
      --text-secondary-dark: #9CA3AF;
      --border-light: #E5E7EB;
      --border-dark: #374151;
      --danger: #EF4444;
      --warning: #F59E0B;
      --success: #10B981;
      --info: #3B82F6;
      --font-family: 'Inter', sans-serif;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      --border-radius: 0.5rem;
    }

    /* Reset and base styles */
    *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    html, body, #root {
        height: 100%;
    }
    
    body {
        font-family: var(--font-family);
        background-color: var(--background-light);
        color: var(--text-primary-light);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        line-height: 1.5;
    }

    h1, h2, h3, h4, h5, h6 {
        font-weight: 700;
        color: inherit;
    }
    
    h1 { font-size: 2rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }

    /* Buttons */
    button {
        font-family: inherit;
        font-size: 1rem;
        font-weight: 500;
        border-radius: var(--border-radius);
        border: 1px solid transparent;
        padding: 0.625rem 1.25rem;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .btn-primary {
        background-image: linear-gradient(to right, var(--primary-start), var(--primary-end));
        color: white;
        box-shadow: var(--shadow-md);
    }
    .btn-primary:hover {
        opacity: 0.9;
        box-shadow: var(--shadow-lg);
    }

    .btn-secondary {
        background-color: var(--card-bg-light);
        color: var(--primary-end);
        border: 1px solid var(--border-light);
    }
    .btn-secondary:hover {
        background-color: #F3F4F6;
    }

    .btn-delete {
        background-color: transparent;
        color: var(--danger);
        padding: 0.25rem 0.5rem;
    }
    .btn-delete:hover {
        background-color: #FEF2F2;
    }

    /* Forms */
    input, textarea, select {
        font-family: inherit;
        font-size: 1rem;
        padding: 0.75rem;
        border: 1px solid var(--border-light);
        border-radius: var(--border-radius);
        width: 100%;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus, textarea:focus, select:focus {
        outline: none;
        border-color: var(--primary-end);
        box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
    }
    textarea {
        min-height: 80px;
        resize: vertical;
    }

    /* Card */
    .card {
        background-color: var(--card-bg-light);
        border: 1px solid var(--border-light);
        border-radius: var(--border-radius);
        padding: 1.5rem;
        box-shadow: var(--shadow-sm);
    }

    /* --- SPECIFIC COMPONENTS --- */

    /* Auth Screen */
    .auth-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: var(--background-light);
    }
    .auth-panel {
        width: 100%;
        max-width: 400px;
        padding: 2.5rem;
        background-color: var(--card-bg-light);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        text-align: center;
    }
    .auth-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
    }
    .auth-panel h2 { margin-bottom: 0.5rem; }
    .auth-panel p { color: var(--text-secondary-light); margin-bottom: 2rem; }
    .auth-panel form { display: flex; flex-direction: column; gap: 1rem; }
    .auth-toggle { font-size: 0.875rem; margin-top: 1.5rem; }
    .auth-toggle button {
        background: none;
        border: none;
        color: var(--primary-end);
        font-weight: 600;
        padding: 0.25rem;
        margin-left: 0.25rem;
    }
    .auth-footer { margin-top: 2rem; }
    .auth-footer button {
        background: none;
        border: none;
        color: var(--text-secondary-light);
        font-size: 0.875rem;
        text-decoration: underline;
    }

    /* Main App Layout */
    .app-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
    }
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        background-color: var(--card-bg-light);
        border-bottom: 1px solid var(--border-light);
        flex-shrink: 0;
    }
    .header-left, .header-right, .user-profile, .logo-section {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .user-profile img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }
    .user-info { line-height: 1.2; }
    .user-info span { font-weight: 600; }
    .user-info small { color: var(--text-secondary-light); font-size: 0.8rem; }
    .btn-logout {
        background: none;
        border: none;
        color: var(--text-secondary-light);
        padding: 0.5rem;
    }
    .btn-logout:hover { background-color: #F3F4F6; }

    .main-content {
        display: flex;
        flex-grow: 1;
        overflow: hidden;
    }
    .sidebar {
        width: 240px;
        background-color: var(--card-bg-light);
        border-right: 1px solid var(--border-light);
        padding: 1rem;
        flex-shrink: 0;
        transition: transform 0.3s ease;
    }
    .sidebar nav { display: flex; flex-direction: column; gap: 0.5rem; }
    .nav-item {
        width: 100%;
        justify-content: flex-start;
        background: none;
        border: none;
        color: var(--text-secondary-light);
        font-weight: 500;
        text-align: left;
    }
    .nav-item.active, .nav-item:hover {
        background-color: #F3F4F6;
        color: var(--text-primary-light);
    }
    .nav-item.active {
        color: var(--primary-end);
    }
    .nav-item svg {
      width: 20px;
      height: 20px;
    }

    .content-panel {
        flex-grow: 1;
        overflow-y: auto;
        padding: 2rem;
        background-color: var(--background-light);
    }

    /* Sidebar on mobile */
    .sidebar-toggle {
        display: none;
        background: none;
        border: none;
        padding: 0.5rem;
        color: var(--text-secondary-light);
    }
    .sidebar-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background-color: rgba(0,0,0,0.5);
        z-index: 99;
    }
    .sidebar-overlay.visible { display: block; }
    
    @media (max-width: 768px) {
        .sidebar-toggle { display: block; }
        .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
            z-index: 100;
            padding-top: 5rem;
        }
        .sidebar.open { transform: translateX(0); }
        .user-profile .user-info { display: none; }
    }


    /* View Containers */
    .view-container { display: flex; flex-direction: column; gap: 2rem; }
    .view-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }
    .back-button {
      background: none;
      border: none;
      font-weight: 600;
      color: var(--text-secondary-light);
      margin-bottom: 1rem;
      padding: 0;
    }
    .back-button:hover { color: var(--text-primary-light); }

    /* Projects Grid */
    .projects-grid, .clients-grid, .team-grid, .cases-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    .project-card {
        background: var(--card-bg-light);
        border-radius: var(--border-radius);
        overflow: hidden;
        box-shadow: var(--shadow-md);
        transition: transform 0.2s, box-shadow 0.2s;
        cursor: pointer;
    }
    .project-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-lg);
    }
    .project-card-image {
        height: 150px;
        background-size: cover;
        background-position: center;
    }
    .project-card-content { padding: 1rem; position: relative; }
    .project-card h3 { margin: 0.5rem 0; }
    .project-card p { font-size: 0.9rem; color: var(--text-secondary-light); margin-bottom: 1rem; }
    .progress-bar {
        height: 8px;
        background-color: var(--border-light);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 1rem;
    }
    .progress-bar-fill {
        height: 100%;
        background-image: linear-gradient(to right, var(--primary-start), var(--primary-end));
        border-radius: 4px;
    }
    .project-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8rem;
    }
    .members-avatars { display: flex; }
    .members-avatars img, .avatar-more {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        margin-left: -10px;
    }
    .members-avatars img:first-child { margin-left: 0; }
    .avatar-more {
      background: var(--border-light);
      color: var(--text-secondary-light);
      display: grid;
      place-items: center;
      font-weight: 600;
    }
    .due-date { display: flex; align-items: center; gap: 0.25rem; color: var(--text-secondary-light); }

    /* Status Badge */
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        display: inline-block;
    }
    .status-em-andamento { background-color: #DBEAFE; color: #2563EB; }
    .status-aguardando-aprovação { background-color: #FEF3C7; color: #D97706; }
    .status-aprovado { background-color: #D1FAE5; color: #059669; }
    .status-recusado { background-color: #FEE2E2; color: #DC2626; }
    .status-standby { background-color: #E5E7EB; color: #4B5563; }
    .status-em-alteração { background-color: #FCE7F3; color: #DB2777; }
    .status-planejado { background-color: #E0E7FF; color: #4338CA; }

    /* Project Detail View */
    .project-detail-view { max-width: 1200px; margin: 0 auto; }
    .detail-header {
        padding: 3rem 2rem;
        border-radius: var(--border-radius);
        color: white;
        margin-bottom: 2rem;
        background-size: cover;
        background-position: center;
        position: relative;
    }
    .upload-kv { position: absolute; bottom: 1rem; right: 1rem; }
    .detail-content-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
    }
    @media (max-width: 992px) {
        .detail-content-grid { grid-template-columns: 1fr; }
    }
    .main-content-column, .sidebar-column { display: flex; flex-direction: column; gap: 2rem; }
    .subproject-list, .team-list, .history-list { list-style: none; display: flex; flex-direction: column; gap: 1rem; }
    .subproject-list li, .team-list li { display: flex; justify-content: space-between; align-items: center; }
    .team-list li { gap: 0.75rem; }
    .team-list img { width: 36px; height: 36px; border-radius: 50%; }
    .btn-delete-subproject { background: none; border: none; color: var(--text-secondary-light); padding: 0.5rem; }
    .btn-delete-subproject:hover { color: var(--danger); background: #FEF2F2; border-radius: 50%; }
    .history-list li { display: flex; align-items: center; gap: 0.75rem; }
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .history-list small { color: var(--text-secondary-light); }
    .comments-list { max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem; }
    .comment-item { display: flex; gap: 0.75rem; }
    .comment-item img { width: 36px; height: 36px; border-radius: 50%; }
    .comment-content p { margin: 0.25rem 0; }
    .comment-content small { color: var(--text-secondary-light); font-size: 0.75rem; }
    .comment-form { display: flex; gap: 0.5rem; }

    /* Clients View */
    .client-card {
        padding: 1.5rem;
        text-align: center;
        background: var(--card-bg-light);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-md);
        transition: transform 0.2s, box-shadow 0.2s;
        cursor: pointer;
    }
    .client-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
    .client-logo {
        height: 60px;
        max-width: 150px;
        object-fit: contain;
        margin-bottom: 1rem;
    }
    .client-card p, .client-card small { color: var(--text-secondary-light); }

    /* Client Detail View */
    .client-detail-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 2rem;
      background: var(--card-bg-light);
      border-radius: var(--border-radius);
      margin-bottom: 2rem;
    }
    .client-logo-container { position: relative; }
    .client-detail-logo {
      width: 100px;
      height: 100px;
      object-fit: contain;
      border-radius: var(--border-radius);
      border: 1px solid var(--border-light);
      padding: 0.5rem;
    }
    .upload-logo-btn {
      position: absolute;
      bottom: -10px;
      right: -10px;
      background: white;
      border: 1px solid var(--border-light);
      border-radius: 50%;
      padding: 0.5rem;
      box-shadow: var(--shadow-md);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .project-list-compact { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
    .project-list-compact li {
      display: grid;
      grid-template-columns: 1fr auto auto;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--border-light);
      border-radius: var(--border-radius);
    }
    .project-info { cursor: pointer; }
    .project-info:hover strong { color: var(--primary-end); }
    .project-status { display: flex; align-items: center; gap: 0.5rem; }
    .btn-edit-status { background: none; border: none; padding: 0.5rem; color: var(--text-secondary-light); }
    .btn-edit-status:hover { background: #F3F4F6; border-radius: 50%; }

    /* Files Table */
    .files-table { width: 100%; border-collapse: collapse; }
    .files-table th, .files-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--border-light);
    }
    .files-table th { font-weight: 600; font-size: 0.8rem; color: var(--text-secondary-light); text-transform: uppercase; }
    .file-name-cell { display: flex; align-items: center; gap: 0.5rem; }
    .file-name-cell a { color: var(--text-primary-light); text-decoration: none; font-weight: 500; }
    .file-name-cell a:hover { text-decoration: underline; color: var(--primary-end); }


    /* Cases View */
    .case-card {
        background: var(--card-bg-light);
        border-radius: var(--border-radius);
        overflow: hidden;
        box-shadow: var(--shadow-md);
    }
    .case-card-image { height: 180px; background-size: cover; background-position: center; }
    .case-card-content { padding: 1.5rem; }
    .client-name { color: var(--text-secondary-light); margin-top: 0.25rem; margin-bottom: 1rem; }

    /* Team View */
    .member-card {
        padding: 1.5rem;
        text-align: center;
        background: var(--card-bg-light);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-md);
        position: relative;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .member-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
    .member-card img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        margin-bottom: 1rem;
    }
    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      position: absolute;
      top: 1.75rem;
      right: calc(50% - 40px + 0.5rem);
    }
    .status-indicator.online { background-color: var(--success); }
    .status-indicator.offline { background-color: var(--text-secondary-light); }
    .permissions-card ul { list-style: none; display: flex; flex-direction: column; gap: 1rem; }
    
    /* Team Profile View */
    .profile-view {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
      align-items: start;
    }
    @media (max-width: 992px) { .profile-view { grid-template-columns: 1fr; } }
    .profile-sidebar {
      padding: 2rem;
      background: var(--card-bg-light);
      border-radius: var(--border-radius);
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: sticky;
      top: 2rem;
    }
    .profile-avatar-container { position: relative; width: 120px; height: 120px; margin: 0 auto; }
    .profile-avatar-container img { width: 100%; height: 100%; border-radius: 50%; }
    .upload-avatar-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      background: white;
      border: 1px solid var(--border-light);
      border-radius: 50%;
      padding: 0.75rem;
      line-height: 0;
      box-shadow: var(--shadow-md);
    }
    .profile-main { display: flex; flex-direction: column; gap: 2rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; }
    .client-assignment-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .checkbox-item { display: flex; align-items: center; gap: 0.5rem; }
    .checkbox-item input { width: auto; }

    /* Modals */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(17, 24, 39, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: var(--border-radius);
        width: 90%;
        max-width: 500px;
        box-shadow: var(--shadow-lg);
        position: relative;
    }
    .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--text-secondary-light);
        cursor: pointer;
    }
    .modal-content h2 { margin-bottom: 1.5rem; }
    .modal-content form { display: flex; flex-direction: column; gap: 1rem; }
    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }

    /* Update Status Modal */
    .status-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin: 1.5rem 0;
    }
    .status-option {
        padding: 1rem;
        border: 1px solid var(--border-light);
        font-weight: 600;
    }
    .status-option.selected {
        border-color: var(--primary-end);
        background-color: #EEF2FF;
        color: var(--primary-end);
        box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
    }

    /* Admin Dashboard */
    .admin-dashboard {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: var(--background-light);
    }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background-color: var(--card-bg-dark);
      color: white;
      flex-shrink: 0;
    }
    .admin-header h1 { font-size: 1.25rem; }
    .admin-content {
      display: flex;
      flex-direction: column;
      padding: 2rem;
      gap: 1.5rem;
      overflow-y: auto;
      flex-grow: 1;
    }
    .admin-nav {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--border-light);
    }
    .admin-nav button {
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      padding: 0.75rem 1.25rem;
      border-radius: 0;
      color: var(--text-secondary-light);
    }
    .admin-nav button.active {
      border-bottom-color: var(--primary-end);
      color: var(--primary-end);
      font-weight: 600;
    }
    .admin-table-container {
      background-color: var(--card-bg-light);
      border: 1px solid var(--border-light);
      border-radius: var(--border-radius);
      overflow-x: auto;
    }
    .admin-table-container table {
      width: 100%;
      border-collapse: collapse;
    }
    .admin-table-container th, .admin-table-container td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border-light);
    }
    .admin-table-container th {
      font-size: 0.8rem;
      text-transform: uppercase;
      color: var(--text-secondary-light);
    }
    .admin-table-container tr:last-child td {
        border-bottom: none;
    }

    `}</style>
);


createRoot(document.getElementById('root')).render(<App />);
