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
    const [users, setUsers] = useStickyState([], 'users');
    const [currentUser, setCurrentUser] = useStickyState(null, 'currentUser');
    const [isAdmin, setIsAdmin] = useStickyState(false, 'isAdmin');
    const [agencyName, setAgencyName] = useStickyState('Manda Hub', 'agencyName');
    
    const [activeTab, setActiveTab] = useState('projects');
    const [projects, setProjects] = useStickyState(initialProjects, 'projects');
    const [files, setFiles] = useStickyState(initialFiles, 'files');
    const [clients, setClients] = useStickyState(initialClients, 'clients');
    const [clientAssets, setClientAssets] = useStickyState(initialClientAssets, 'clientAssets');
    const [teamMembers, setTeamMembers] = useStickyState([], 'teamMembers');
    
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [previewingFile, setPreviewingFile] = useState(null);
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
            password: password, // In a real app, this should be hashed.
            agencyName: agencyName,
        };
        setUsers(prev => [...prev, newUser]);

        const owner = {
            id: newUser.id,
            name: ownerName,
            email: ownerEmail,
            role: 'Owner',
            avatarUrl: `https://i.pravatar.cc/150?u=${newUser.id}`,
            status: 'Online',
            assignedClients: [],
        };

        // Reset the workspace for the new agency
        setAgencyName(agencyName);
        setTeamMembers([owner]);
        setClients(initialClients);
        setProjects(initialProjects);
        setFiles(initialFiles);
        setClientAssets(initialClientAssets);

        // Log the new user in
        setCurrentUser(owner);
    };

    const handleLogin = ({ email, password }) => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            // In this single-tenant setup, we just log in.
            // A multi-tenant app would load the agency's specific data here.
             const memberProfile = teamMembers.find(m => m.id === user.id);
             if (memberProfile) {
                setCurrentUser(memberProfile);
             } else {
                 alert("Erro de consistência de dados: Perfil de membro não encontrado para o usuário. Por favor, cadastre-se novamente.");
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
            ...projectData,
            progress: 0,
            createdAt: new Date(),
            history: [{ status: projectData.status, date: new Date() }],
            members: [currentUser],
            subprojects: [],
            keyVisual: null,
            comments: [],
        };
        setProjects(prev => [newProject, ...prev]);
        setCreateModalOpen(false);
    };
    
    const handleCreateClient = (clientData) => {
        const newClient = {
            id: crypto.randomUUID(),
            ...clientData
        };
        setClients(prev => [newClient, ...prev]);
        setCreateClientModalOpen(false);
    };

    const handleCreateSubproject = (subprojectData) => {
        if (!selectedProject) return;
        const newSubproject = {
            id: crypto.randomUUID(),
            ...subprojectData
        };
        
        const updatedProjects = projects.map(p => {
            if (p.id === selectedProject.id) {
                const updatedSubprojects = [...(p.subprojects || []), newSubproject];
                return { ...p, subprojects: updatedSubprojects };
            }
            return p;
        });

        setProjects(updatedProjects);
        // also update the selectedProject state to reflect the change immediately
        setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id));
        setCreateSubprojectModalOpen(false);
    };

    const handleDeleteProject = (e, projectId) => {
        e.stopPropagation();
        if (!window.confirm("Tem certeza que deseja excluir este projeto?")) return;
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setFiles(prev => prev.filter(f => f.projectId !== projectId));
    };
    
    const handleDeleteSubproject = (subprojectId) => {
        if (!selectedProject) return;
        
        const updatedProjects = projects.map(p => {
            if (p.id === selectedProject.id) {
                const updatedSubprojects = p.subprojects.filter(sp => sp.id !== subprojectId);
                return { ...p, subprojects: updatedSubprojects };
            }
            return p;
        });

        setProjects(updatedProjects);
        setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id));
    };

    const handleKeyVisualUpload = (event) => {
        const file = event.target.files[0];
        if (!file || !selectedProject) return;

        const reader = new FileReader();
        reader.onload = (e) => {
             const updatedProjects = projects.map(p => {
                if (p.id === selectedProject.id) {
                    return { ...p, keyVisual: e.target.result };
                }
                return p;
            });
            setProjects(updatedProjects);
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

        const updatedProjects = projects.map(p => {
            if (p.id === projectId) {
                return { ...p, comments: [...p.comments, newComment] };
            }
            return p;
        });

        setProjects(updatedProjects);
        setSelectedProject(prev => ({...prev, comments: [...prev.comments, newComment]}));
    };

    const handleRegisterMember = (memberData) => {
        const newMember = {
            id: crypto.randomUUID(),
            avatarUrl: `https://i.pravatar.cc/150?u=${crypto.randomUUID()}`,
            status: 'Offline',
            assignedClients: [],
            ...memberData,
        };
        setTeamMembers(prev => [...prev, newMember]);
        setRegisterMemberModalOpen(false);
    };
    
    const handleUpdateMemberProfile = (memberId, updatedData) => {
        const updatedMembers = teamMembers.map(m =>
            m.id === memberId ? { ...m, ...updatedData } : m
        );
        setTeamMembers(updatedMembers);
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
        setProjects(prevProjects =>
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
            const updatedClients = clients.map(c =>
                c.id === clientId ? { ...c, logoUrl: e.target.result as string } : c
            );
            setClients(updatedClients);
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
            clientId: clientId,
            name: file.name,
            type: file.type,
            size: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`,
            url: URL.createObjectURL(file),
            uploadedAt: new Date(),
        };
        setClientAssets(prev => [newAsset, ...prev].sort((a,b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()));
    };

    const handleExportCasePDF = async (project) => {
        if (!window.jspdf) {
            alert("Biblioteca PDF não carregada. Por favor, tente novamente.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
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
                doc.text(
                    `Case exportado por ${agencyName}`,
                    margin,
                    pageHeight - 10
                );
                doc.text(
                    `Página ${i} de ${pageCount}`,
                    pageWidth - margin,
                    pageHeight - 10,
                    { align: 'right' }
                );
            }
        };

        let y = margin;
    
        const addText = (text, size, isBold, yPos) => {
            if (yPos > pageHeight - margin - 20) {
                addPageWithFooter();
                yPos = margin;
            }
            doc.setFontSize(size);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
            doc.text(lines, margin, yPos);
            return yPos + (lines.length * (size * 0.35)) + 5;
        };
    
        y = addText(project.name, 22, true, y);
        const client = clients.find(c => c.id === project.clientId);
        if (client) {
            y = addText(`Cliente: ${client.name}`, 12, false, y);
        }
        y += 5;
    
        if (project.keyVisual) {
            y = addText('Key Visual', 16, true, y);
            try {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = project.keyVisual;
                await new Promise((resolve, reject) => { 
                    img.onload = resolve;
                    img.onerror = reject;
                });
                
                const imgProps = doc.getImageProperties(img);
                const aspect = imgProps.width / imgProps.height;
                let imgWidth = pageWidth - margin * 2;
                let imgHeight = imgWidth / aspect;
    
                if (y + imgHeight > pageHeight - margin) {
                    addPageWithFooter();
                    y = margin;
                }
    
                doc.addImage(img, 'JPEG', margin, y, imgWidth, imgHeight);
                y += imgHeight + 10;
            } catch (error) {
                console.error("Error adding image to PDF:", error);
                y = addText('Não foi possível carregar a imagem.', 10, false, y);
            }
        }
    
        if (project.subprojects && project.subprojects.length > 0) {
            if (y > pageHeight - margin - 20) {
                addPageWithFooter();
                y = margin;
            }
            y = addText('Subprojetos / Desdobramentos', 18, true, y);
    
            project.subprojects.forEach(sp => {
                if (y > pageHeight - margin - 20) {
                     addPageWithFooter();
                     y = margin;
                }
                y = addText(sp.name, 14, true, y);
                y = addText(sp.description, 11, false, y);
                y += 5;
            });
        }
        
        addFooter();
        doc.save(`Case_${project.name.replace(/\s/g, '_')}.pdf`);
    };
    
    const handleDeleteUser = (userId) => {
        if (window.confirm("Tem certeza que deseja excluir esta agência? Esta ação é irreversível.")) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    useEffect(() => {
        if(activeTab !== 'projects-detail') {
            setSelectedProject(null);
        }
         if(activeTab !== 'clients') {
            setSelectedClient(null);
        }
         if(activeTab !== 'team') {
            setSelectedMember(null);
        }
    }, [activeTab]);

    if (isAdmin) {
        return <AdminDashboard users={users} onLogout={handleLogout} onDeleteUser={handleDeleteUser} />;
    }

    if (!currentUser) {
        return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} onAdminLogin={handleAdminLogin} usersExist={users.length > 0} />;
    }
    
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
            {previewingFile && <FilePreviewModal file={previewingFile} onClose={() => setPreviewingFile(null)} />}
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

const AdminDashboard = ({ users, onLogout, onDeleteUser }) => {
    return (
        <>
            <Style />
            <div className="admin-dashboard">
                <header className="admin-header">
                    <div className="logo-section">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="4" ry="4" fill="var(--primary-end)" />
                            <path d="M7 15.5V9.5C7 8.11929 8.11929 7 9.5 7C10.8807 7 12 8.11929 12 9.5V11.5C12 10.1193 13.1193 9 14.5 9C15.8807 9 17 10.1193 17 11.5V15.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h3>Painel ADM - Manda Hub</h3>
                    </div>
                    <button onClick={onLogout} className="logout-button" title="Sair">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </header>
                <main className="admin-content">
                    <div className="view-header">
                        <div>
                            <h1 className="gradient-text">Agências Cadastradas</h1>
                            <p>Visualize e gerencie todas as agências na plataforma.</p>
                        </div>
                    </div>
                    <div className="agency-list-container">
                        {users.length > 0 ? (
                            <table className="agency-table">
                                <thead>
                                    <tr>
                                        <th>Nome da Agência</th>
                                        <th>Nome do Dono</th>
                                        <th>Email de Login</th>
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
                                                <button onClick={() => onDeleteUser(user.id)} className="delete-agency-button" title="Excluir agência">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <h3>Nenhuma agência cadastrada</h3>
                                <p>Quando novas agências se registrarem, elas aparecerão aqui.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

const AuthScreen = ({ onLogin, onRegister, onAdminLogin, usersExist }) => {
    const [isLoginView, setIsLoginView] = useState(usersExist);

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [agencyName, setAgencyName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (loginEmail === 'adm@mandahub.com' && loginPassword === 'admin') {
            onAdminLogin();
        } else {
            if (!loginEmail || !loginPassword) return;
            onLogin({ email: loginEmail, password: loginPassword });
        }
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        if (!agencyName.trim() || !ownerName.trim() || !ownerEmail.trim() || !password.trim()) return;
        onRegister({ agencyName, ownerName, ownerEmail, password });
    };

    const SwitchModeButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
        <button type="button" onClick={onClick} className="switch-auth-mode-button">
            {children}
        </button>
    );

    return (
        <>
            <Style />
            <div className="auth-container">
                <div className="auth-modal">
                    {isLoginView ? (
                        <>
                            <header className="auth-modal-header">
                                <div>
                                    <h3 className="gradient-text">Bem-vindo de volta!</h3>
                                    <p>Faça login para acessar seu hub.</p>
                                </div>
                            </header>
                            <form onSubmit={handleLoginSubmit}>
                                <div className="form-group">
                                    <label htmlFor="loginEmail">E-mail</label>
                                    <input type="email" id="loginEmail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="loginPassword">Senha</label>
                                    <input type="password" id="loginPassword" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                                </div>
                                <div className="form-actions" style={{justifyContent: 'center', marginTop: '2.5rem'}}>
                                    <button type="submit" className="button-primary" style={{width: '100%', padding: '0.8rem'}}>Entrar</button>
                                </div>
                            </form>
                            <p className="auth-switcher-text">
                                Não tem uma conta? <SwitchModeButton onClick={() => setIsLoginView(false)}>Cadastre-se</SwitchModeButton>
                            </p>
                        </>
                    ) : (
                        <>
                            <header className="auth-modal-header">
                                <div>
                                    <h3 className="gradient-text">Bem-vindo ao Manda Hub!</h3>
                                    <p>Vamos configurar sua agência.</p>
                                </div>
                            </header>
                            <form onSubmit={handleRegisterSubmit}>
                                <div className="form-group">
                                    <label htmlFor="agencyName">Nome da Agência/Empresa</label>
                                    <input type="text" id="agencyName" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ownerName">Seu Nome Completo</label>
                                    <input type="text" id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ownerEmail">Seu E-mail (será seu login)</label>
                                    <input type="email" id="ownerEmail" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Crie uma Senha</label>
                                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <div className="form-actions" style={{justifyContent: 'center', marginTop: '2.5rem'}}>
                                    <button type="submit" className="button-primary" style={{width: '100%', padding: '0.8rem'}}>Concluir Configuração</button>
                                </div>
                            </form>
                             <p className="auth-switcher-text">
                                Já tem uma conta? <SwitchModeButton onClick={() => setIsLoginView(true)}>Faça login</SwitchModeButton>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};


const Header = ({ agencyName, currentUser, onLogout, onToggleSidebar }) => (
    <header className="app-header">
      <div className="header-left">
        <button className="hamburger-menu" onClick={onToggleSidebar} aria-label="Abrir menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div className="logo-section">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="4" ry="4" fill="var(--primary-end)"/>
            <path d="M7 15.5V9.5C7 8.11929 8.11929 7 9.5 7C10.8807 7 12 8.11929 12 9.5V11.5C12 10.1193 13.1193 9 14.5 9C15.8807 9 17 10.1193 17 11.5V15.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>{agencyName}</h3>
        </div>
      </div>
      <div className="user-section">
        <img src={currentUser.avatarUrl} alt={currentUser.name} className="user-avatar" />
        <span className="user-name">{currentUser.name}</span>
        <button onClick={onLogout} className="logout-button" title="Sair">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </header>
);

const Sidebar = ({ activeTab, onTabChange, isOpen }) => {
    const navItems = [
        { id: 'projects', label: 'Feed', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16"></path></svg> },
        { id: 'cases', label: 'Cases', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> },
        { id: 'clients', label: 'Clientes', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg> },
        { id: 'team', label: 'Equipe', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> }
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        className={activeTab.startsWith(item.id) ? 'active' : ''}
                        onClick={() => onTabChange(item.id)}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

const timeSince = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `há ${Math.floor(interval)} anos`;
    interval = seconds / 2592000;
    if (interval > 1) return `há ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `há ${Math.floor(interval)} dias`;
    interval = seconds / 3600;
    if (interval > 1) return `há ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `há ${Math.floor(interval)} minutos`;
    return "agora mesmo";
};

const ProjectsFeedView = ({ projects, onProjectSelect }) => {
    const [feed, setFeed] = useState([]);

    useEffect(() => {
        const generateActivityFeed = (projects) => {
            const newFeed = [];

            projects.forEach(project => {
                project.history?.forEach((historyItem, index) => {
                    const type = index === 0 ? 'PROJECT_CREATED' : 'STATUS_UPDATE';
                    newFeed.push({
                        id: `status-${project.id}-${historyItem.date.toISOString()}`,
                        type: type,
                        timestamp: historyItem.date,
                        data: {
                            projectName: project.name,
                            project: project,
                            status: historyItem.status,
                            user: project.members[0] || sampleMembers.find(m => m.id === 3)
                        }
                    });
                });
                
                project.comments.forEach(comment => {
                    newFeed.push({
                        id: `comment-${comment.id}`,
                        type: 'NEW_COMMENT',
                        timestamp: comment.timestamp,
                        data: {
                            projectName: project.name,
                            project: project,
                            user: comment.author,
                            text: comment.text
                        }
                    });
                });
            });

            return newFeed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        };

        setFeed(generateActivityFeed(projects));
    }, [projects]);
    
    const ActivityItem: React.FC<{ item: any }> = ({ item }) => {
        const { type, timestamp, data } = item;
        const user = data.user;

        const renderContent = () => {
            switch (type) {
                case 'PROJECT_CREATED':
                    return <>criou o projeto <strong onClick={() => onProjectSelect(data.project)}>{data.projectName}</strong></>;
                case 'STATUS_UPDATE':
                    return <>atualizou o status do projeto <strong onClick={() => onProjectSelect(data.project)}>{data.projectName}</strong> para <strong>{data.status}</strong></>;
                case 'NEW_COMMENT':
                    return <>comentou no projeto <strong onClick={() => onProjectSelect(data.project)}>{data.projectName}</strong>: <em>"{data.text}"</em></>;
                default:
                    return null;
            }
        };

        return (
            <div className="activity-item">
                <img src={user.avatarUrl} alt={user.name} className="activity-avatar" />
                <div className="activity-content">
                    <p>
                        <strong>{user.name}</strong> {renderContent()}
                    </p>
                    <span className="activity-timestamp">{timeSince(timestamp)}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="projects-feed-view">
             <div className="view-header">
                <div>
                    <h1 className="gradient-text">Feed de Atividades</h1>
                    <p>Veja as últimas atualizações de todos os projetos</p>
                </div>
            </div>
            <div className="activity-list">
                {feed.length > 0 ? (
                    feed.map(item => <ActivityItem key={item.id} item={item} />)
                ) : (
                     <div className="empty-state">
                        <h3>Nenhuma atividade ainda</h3>
                        <p>Crie um projeto ou adicione um comentário para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProjectCard: React.FC<{
    project: any;
    filesCount: any;
    subprojectsCount: any;
    onDeleteProject: any;
    onClick: any;
    onOpenStatusModal: any;
}> = ({ project, filesCount, subprojectsCount, onDeleteProject, onClick, onOpenStatusModal }) => {
    const { name, description, status, dueDate, progress, members } = project;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Em Andamento': return 'status-in-progress';
            case 'Aprovado':
            case 'Concluído': return 'status-approved';
            case 'Standby':
            case 'Pausado': return 'status-standby';
            case 'Aguardando Aprovação':
            case 'Em Revisão': return 'status-review';
            case 'Em Alteração': return 'status-altering';
            case 'Recusado': return 'status-rejected';
            default: return 'status-planned';
        }
    };

    const handleStatusClick = (e) => {
        e.stopPropagation();
        onOpenStatusModal(project);
    };
    
    return (
        <div className="project-card" onClick={onClick}>
            <div className="project-card-header">
                <h3>{name}</h3>
                <button onClick={(e) => { e.stopPropagation(); onDeleteProject(e, project.id); }} className="options-button delete-project-button" title="Excluir projeto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
            <p className="project-card-description">{description}</p>
            <div className="project-card-meta">
                <button onClick={handleStatusClick} className={`status-tag ${getStatusClass(status)}`}>{status}</button>
                <div className="due-date">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{formatDate(dueDate)}</span>
                </div>
            </div>
            <div className="progress-section">
                <div className="progress-labels">
                    <span>Progresso</span>
                    <span>{progress}%</span>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <div className="project-card-footer">
                <div className="members-files-info">
                   <div className="info-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>{members.length} {members.length === 1 ? 'membro' : 'membros'}</span>
                   </div>
                   <div className="info-item">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                       <span>{filesCount} {filesCount === 1 ? 'arquivo' : 'arquivos'}</span>
                   </div>
                   <div className="info-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l3 6h12l3-6H3z"></path><path d="M3 18v-6h18v6H3z"></path><path d="M12 6V3"></path><path d="M12 18v3"></path></svg>
                        <span>{subprojectsCount} {subprojectsCount === 1 ? 'subprojeto' : 'subprojetos'}</span>
                    </div>
                </div>
                <div className="avatar-stack">
                    {members.slice(0, 3).map((member, index) => (
                        <img key={member.id} src={member.avatarUrl} alt={member.name} title={member.name} style={{ zIndex: members.length - index }} />
                    ))}
                </div>
            </div>
        </div>
    );
};


const ProjectDetailView = ({ project, onBack, onAddSubproject, onDeleteSubproject, onKeyVisualUpload, onPostComment }) => {
    const kvInputRef = useRef(null);

    return (
        <section className="project-detail-view">
            <div className="panel-header">
                <div className="panel-header-left">
                     <button onClick={onBack} className="back-button" title="Voltar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <h4>{project.name}</h4>
                </div>
            </div>
            <div className="project-detail-content">
                <div className="key-visual-panel">
                    <div className="kv-display-area">
                        {project.keyVisual 
                            ? <img src={project.keyVisual} alt="Key Visual" /> 
                            : <div className="kv-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg><span>Nenhum KV carregado</span></div>
                        }
                    </div>
                     <button onClick={() => kvInputRef.current?.click()} className="button-primary kv-upload-button">
                        Carregar Key Visual (KV)
                    </button>
                    <input type="file" ref={kvInputRef} style={{display: 'none'}} onChange={onKeyVisualUpload} accept="image/*" />
                </div>
                <aside className="subprojects-panel">
                    <div className="subprojects-header">
                        <h5>Subprojetos / Desdobramentos</h5>
                    </div>
                     <div className="subproject-list">
                        {(!project.subprojects || project.subprojects.length === 0) ? (
                            <p className="empty-state-small">Nenhum subprojeto criado.</p>
                        ) : (
                            project.subprojects.map(sp => (
                                <div key={sp.id} className="subproject-item">
                                    <div className="subproject-info">
                                        <strong>{sp.name}</strong>
                                        <p>{sp.description}</p>
                                    </div>
                                    <button onClick={() => onDeleteSubproject(sp.id)} className="delete-button" title="Excluir subprojeto">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                     <button onClick={onAddSubproject} className="button-secondary-small add-subproject-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Adicionar Subprojeto
                    </button>
                </aside>
                <CommentsPanel comments={project.comments} onPostComment={(text) => onPostComment(project.id, text)} />
            </div>
        </section>
    );
};

const CommentsPanel = ({ comments, onPostComment }) => {
    const [newComment, setNewComment] = useState('');
    const commentsEndRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onPostComment(newComment);
        setNewComment('');
    };
    
    React.useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);
    
    return (
        <aside className="comments-panel">
            <div className="comments-header">
                <h5>Comentários e Feedback</h5>
            </div>
            <div className="comment-list">
                 {(!comments || comments.length === 0) ? (
                    <p className="empty-state-small">Nenhum comentário ainda. Seja o primeiro a deixar um feedback!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                            <img src={comment.author.avatarUrl} alt={comment.author.name} className="comment-avatar" />
                            <div className="comment-content">
                                <div className="comment-author-time">
                                    <strong>{comment.author.name}</strong>
                                    <span>{timeSince(comment.timestamp)}</span>
                                </div>
                                <p>{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={commentsEndRef} />
            </div>
            <form className="comment-form" onSubmit={handleSubmit}>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar um comentário..."
                    rows="3"
                />
                <button type="submit" className="button-primary-small" disabled={!newComment.trim()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    <span>Enviar</span>
                </button>
            </form>
        </aside>
    );
};


const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-button">&times;</button>
        {file.content && file.type?.startsWith('image/') ? (
          <img src={file.content} alt={`Preview of ${file.name}`} style={{maxWidth: '100%', maxHeight: '80vh', display: 'block'}}/>
        ) : (
          <div className="non-image-preview">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
            <h3>{file.name}</h3>
            <p style={{color: 'var(--text-secondary)', margin: '0.5rem 0 2rem 0'}}>{file.type} - {file.size}</p>
            <a href={file.content || '#'} download={file.name} className="button-primary">Download</a>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateProjectModal = ({ clients, onCreateProject, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [clientId, setClientId] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateProject({ name, description, clientId, dueDate, status: 'Planejado' });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Criar Novo Projeto</h3>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </header>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="projectName">Nome do Projeto</label>
                        <input id="projectName" type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="projectDesc">Descrição</label>
                        <textarea id="projectDesc" value={description} onChange={e => setDescription(e.target.value)} rows="3"></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="projectClient">Cliente</label>
                        <select id="projectClient" value={clientId} onChange={e => setClientId(e.target.value)} required>
                            <option value="" disabled>Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="projectDueDate">Data de Entrega</label>
                        <input id="projectDueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>
                    <footer className="modal-footer">
                        <button type="button" className="button-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="button-primary">Criar Projeto</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const CreateSubprojectModal = ({ onCreateSubproject, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateSubproject({ name, description });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                 <header className="modal-header">
                    <h3>Adicionar Subprojeto</h3>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </header>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="subprojectName">Nome do Subprojeto/Peça</label>
                        <input id="subprojectName" type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="subprojectDesc">Descrição</label>
                        <textarea id="subprojectDesc" value={description} onChange={e => setDescription(e.target.value)} rows="3" required></textarea>
                    </div>
                    <footer className="modal-footer">
                        <button type="button" className="button-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="button-primary">Adicionar</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const CreateClientModal = ({ onCreateClient, onClose }) => {
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateClient({ name, contactPerson, email, phone, logoUrl: `https://avatar.vercel.sh/${name}.svg?text=${name.substring(0, 2)}` });
    };
    
    return (
         <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                 <header className="modal-header">
                    <h3>Novo Cliente</h3>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </header>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="clientName">Nome do Cliente</label>
                        <input id="clientName" type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="clientContact">Pessoa de Contato</label>
                        <input id="clientContact" type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="clientEmail">Email</label>
                        <input id="clientEmail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="clientPhone">Telefone</label>
                        <input id="clientPhone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <footer className="modal-footer">
                        <button type="button" className="button-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="button-primary">Salvar Cliente</button>
                    </footer>
                </form>
            </div>
        </div>
    )
};

const RegisterMemberModal = ({ onRegisterMember, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Designer');

    const handleSubmit = (e) => {
        e.preventDefault();
        onRegisterMember({ name, email, role });
    };
    
    return (
         <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                 <header className="modal-header">
                    <h3>Registrar Novo Membro</h3>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </header>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="memberName">Nome Completo</label>
                        <input id="memberName" type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="memberEmail">Email</label>
                        <input id="memberEmail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                     <div className="form-group">
                        <label htmlFor="memberRole">Cargo</label>
                        <select id="memberRole" value={role} onChange={e => setRole(e.target.value)} required>
                            <option value="Designer">Designer</option>
                            <option value="Developer">Developer</option>
                        </select>
                    </div>
                    <footer className="modal-footer">
                        <button type="button" className="button-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="button-primary">Registrar</button>
                    </footer>
                </form>
            </div>
        </div>
    )
};

const UpdateStatusModal = ({ project, stati, onUpdateStatus, onClose }) => {
    
    const handleStatusUpdate = (newStatus) => {
        onUpdateStatus(project.id, newStatus);
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content status-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Alterar Status</h3>
                    <p>Projeto: <strong>{project.name}</strong></p>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </header>
                 <div className="modal-body">
                    <div className="status-grid">
                        {stati.map(status => (
                            <button 
                                key={status} 
                                className={`button-status ${project.status === status ? 'active' : ''}`}
                                onClick={() => handleStatusUpdate(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClientsView = ({ clients, onClientSelect, onCreateClient }) => (
    <div className="clients-view">
        <div className="view-header">
            <div>
                <h1 className="gradient-text">Clientes</h1>
                <p>Gerencie seus clientes e os projetos deles.</p>
            </div>
            <button onClick={onCreateClient} className="button-primary">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>Novo Cliente</span>
            </button>
        </div>
        <div className="clients-grid">
            {clients.map(client => (
                <div key={client.id} className="client-card" onClick={() => onClientSelect(client)}>
                    <img src={client.logoUrl} alt={`${client.name} logo`} className="client-logo" />
                    <h4>{client.name}</h4>
                    <p>{client.contactPerson}</p>
                </div>
            ))}
        </div>
    </div>
);

const ClientDetailView = ({ client, projects, files, onBack, onProjectSelect, onDeleteProject, onOpenStatusModal, onCreateProject, clientAssets, onLogoUpload, onAssetUpload }) => {
    const logoInputRef = useRef(null);
    const assetInputRef = useRef(null);

    const handleAssetUpload = (e) => {
        if (e.target.files.length > 0) {
            onAssetUpload(client.id, e.target.files[0]);
            e.target.value = null; // Reset input
        }
    };
    
    return (
        <section className="client-detail-view">
             <div className="panel-header">
                <div className="panel-header-left">
                     <button onClick={onBack} className="back-button" title="Voltar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                </div>
            </div>
            <div className="client-detail-header">
                 <div className="client-logo-container">
                    <img src={client.logoUrl} alt={`${client.name} logo`} className="client-detail-logo" />
                    <button className="upload-logo-btn" onClick={() => logoInputRef.current?.click()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    </button>
                    <input type="file" ref={logoInputRef} onChange={(e) => onLogoUpload(client.id, e.target.files[0])} accept="image/*" style={{display: 'none'}} />
                 </div>
                 <div>
                    <h1 className="gradient-text">{client.name}</h1>
                    <div className="client-contact-info">
                        <span>{client.contactPerson}</span>
                        <span>&middot;</span>
                        <a href={`mailto:${client.email}`}>{client.email}</a>
                        <span>&middot;</span>
                        <a href={`tel:${client.phone}`}>{client.phone}</a>
                    </div>
                 </div>
            </div>

            <div className="client-detail-content">
                <div className="client-projects-section">
                     <div className="section-header">
                        <h2>Projetos</h2>
                        <button onClick={onCreateProject} className="button-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            <span>Novo Projeto</span>
                        </button>
                    </div>
                    <div className="projects-grid">
                        {projects.length > 0 ? projects.map(p => (
                            <ProjectCard 
                                key={p.id}
                                project={p}
                                filesCount={files.filter(f => f.projectId === p.id).length}
                                subprojectsCount={p.subprojects?.length || 0}
                                onDeleteProject={onDeleteProject}
                                onClick={() => onProjectSelect(p)}
                                onOpenStatusModal={onOpenStatusModal}
                            />
                        )) : (
                             <div className="empty-state">
                                <h3>Nenhum projeto para este cliente</h3>
                                <p>Clique em "Novo Projeto" para começar.</p>
                            </div>
                        )}
                    </div>
                </div>
                <aside className="client-assets-section">
                     <div className="section-header">
                        <h4>Ativos do Cliente</h4>
                        <button className="button-secondary-small" onClick={() => assetInputRef.current?.click()}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                           Carregar
                        </button>
                        <input type="file" ref={assetInputRef} onChange={handleAssetUpload} style={{display: 'none'}} />
                    </div>
                    <div className="asset-list">
                        {clientAssets.length > 0 ? clientAssets.map(asset => (
                            <div key={asset.id} className="asset-item">
                                {getFileIcon(asset.type)}
                                <div className="asset-info">
                                    <a href={asset.url} download={asset.name} title={asset.name}>{asset.name}</a>
                                    <span>{asset.size} - {timeSince(asset.uploadedAt)}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="empty-state-small">Nenhum ativo carregado.</p>
                        )}
                    </div>
                </aside>
            </div>

        </section>
    );
};

const CasesView = ({ projects, clients, onExportCase }) => {
    const approvedProjects = projects.filter(p => p.status === 'Aprovado' && p.progress === 100);

    return (
        <div className="cases-view">
             <div className="view-header">
                <div>
                    <h1 className="gradient-text">Cases de Sucesso</h1>
                    <p>Projetos aprovados e concluídos que se tornaram cases.</p>
                </div>
            </div>
            <div className="cases-grid">
                {approvedProjects.length > 0 ? (
                    approvedProjects.map(project => {
                        const client = clients.find(c => c.id === project.clientId);
                        return (
                            <div key={project.id} className="case-card">
                                {project.keyVisual && <img src={project.keyVisual} alt={project.name} className="case-card-kv" />}
                                <div className="case-card-content">
                                    <h4>{project.name}</h4>
                                    <p>Cliente: {client ? client.name : 'N/A'}</p>
                                    <button onClick={() => onExportCase(project)} className="button-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        Exportar Case em PDF
                                    </button>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="empty-state">
                        <h3>Nenhum case disponível</h3>
                        <p>Conclua e aprove um projeto para que ele apareça aqui.</p>
                    </div>
                )}
            </div>
        </div>
    )
};

const TeamView = ({ members, permissions, onRegisterClick, onMemberSelect }) => (
    <div className="team-view">
         <div className="view-header">
            <div>
                <h1 className="gradient-text">Equipe</h1>
                <p>Gerencie os membros e suas permissões.</p>
            </div>
            <button onClick={onRegisterClick} className="button-primary">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>Registrar Membro</span>
            </button>
        </div>
        <div className="team-content">
            <div className="member-list-container">
                <h4>Membros</h4>
                <ul className="member-list">
                    {members.map(member => (
                        <li key={member.id} onClick={() => onMemberSelect(member)}>
                            <div className="member-info">
                                <img src={member.avatarUrl} alt={member.name} />
                                <div>
                                    <strong>{member.name}</strong>
                                    <span>{member.role}</span>
                                </div>
                            </div>
                            <span className={`status-dot ${member.status?.toLowerCase()}`}></span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="permissions-container">
                <h4>Permissões</h4>
                 <ul className="permissions-list">
                    {permissions.map(perm => (
                        <li key={perm.role}>
                            <strong>{perm.role}</strong>
                            <p>{perm.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

const TeamMemberProfileView = ({ member, clients, onBack, onUpdateProfile, onAvatarUpload }) => {
    const [name, setName] = useState(member.name);
    const [email, setEmail] = useState(member.email);
    const avatarInputRef = useRef(null);
    
    const handleSave = () => {
        onUpdateProfile(member.id, { name, email });
    };

    return (
        <section className="team-member-profile-view">
            <div className="panel-header">
                <div className="panel-header-left">
                     <button onClick={onBack} className="back-button" title="Voltar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                </div>
            </div>
            <div className="profile-header">
                <div className="profile-avatar-container">
                    <img src={member.avatarUrl} alt={member.name} className="profile-avatar" />
                    <button className="upload-avatar-btn" onClick={() => avatarInputRef.current?.click()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    </button>
                    <input type="file" ref={avatarInputRef} onChange={(e) => onAvatarUpload(member.id, e.target.files[0])} accept="image/*" style={{display: 'none'}} />
                </div>
                <h2>{member.name}</h2>
                <span className="profile-role">{member.role}</span>
            </div>
            <div className="profile-form-container">
                <div className="form-group">
                    <label htmlFor="profileName">Nome Completo</label>
                    <input id="profileName" type="text" value={name} onChange={e => setName(e.target.value)} disabled={member.role === 'Owner'} />
                </div>
                 <div className="form-group">
                    <label htmlFor="profileEmail">Email</label>
                    <input id="profileEmail" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={member.role === 'Owner'} />
                </div>
                {member.role !== 'Owner' && (
                     <div className="form-actions">
                        <button onClick={handleSave} className="button-primary">Salvar Alterações</button>
                    </div>
                )}
            </div>
        </section>
    )
};

const Style = () => {
    const css = `
    :root {
      --bg-primary: #121212;
      --bg-secondary: #1E1E1E;
      --bg-tertiary: #2A2A2A;
      --bg-hover: #333333;
      --border-color: #383838;
      --text-primary: #EAEAEA;
      --text-secondary: #A0A0A0;
      --primary-start: #FF6B00;
      --primary-end: #D43F00;
      --gradient-text: linear-gradient(90deg, var(--primary-start), var(--primary-end));
      --status-in-progress: #3B82F6;
      --status-approved: #10B981;
      --status-standby: #A855F7;
      --status-review: #F59E0B;
      --status-altering: #F97316;
      --status-rejected: #EF4444;
      --font-family: 'Inter', sans-serif;
    }
    
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    html, body, #root {
        height: 100%;
    }

    body {
        font-family: var(--font-family);
        background-color: var(--bg-primary);
        color: var(--text-primary);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow: hidden;
    }

    button, input, select, textarea {
        font-family: var(--font-family);
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 0.6rem 0.8rem;
        font-size: 0.9rem;
    }

    textarea {
      resize: vertical;
    }

    input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: var(--primary-end);
        box-shadow: 0 0 0 2px rgba(212, 63, 0, 0.3);
    }
    
    button {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: background-color 0.2s ease, transform 0.1s ease;
    }

    button:active {
      transform: scale(0.98);
    }

    .button-primary {
        background: var(--gradient-text);
        border: none;
        color: white;
        font-weight: 600;
    }
    .button-primary:hover { background-color: var(--primary-end); }

    .button-secondary {
        background-color: var(--bg-tertiary);
    }
    .button-secondary:hover { background-color: var(--bg-hover); }
    
    .button-primary-small {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
    }
    
    .button-secondary-small {
        background-color: var(--bg-tertiary);
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
    }
     .button-secondary-small:hover { background-color: var(--bg-hover); }

    .gradient-text {
        background: var(--gradient-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
    }

    /* --- Auth Screen --- */
    .auth-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        background-color: #0A0A0A;
    }
    .auth-modal {
        background-color: var(--bg-secondary);
        padding: 2.5rem 3rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        width: 100%;
        max-width: 450px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .auth-modal-header { margin-bottom: 2rem; }
    .auth-modal-header h3 { font-size: 1.8rem; margin-bottom: 0.25rem; }
    .auth-modal-header p { color: var(--text-secondary); }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 500; }
    .form-group input { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; }
    .auth-switcher-text {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    .switch-auth-mode-button {
        background: none;
        border: none;
        color: var(--primary-start);
        font-weight: 600;
        padding: 0;
        margin-left: 0.25rem;
    }
    .switch-auth-mode-button:hover { text-decoration: underline; }

    /* --- App Layout --- */
    .app-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .app-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1.5rem;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
    }
    .header-left, .logo-section, .user-section { display: flex; align-items: center; gap: 1rem; }
    .logo-section h3 { font-size: 1.2rem; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; }
    .user-name { font-weight: 500; }
    .logout-button { background: none; border: none; padding: 0.25rem; }
    .logout-button:hover { color: var(--primary-start); }
    .hamburger-menu { background: none; border: none; display: none; }
    
    .main-content {
        display: flex;
        flex-grow: 1;
        overflow: hidden;
    }
    .sidebar {
        width: 220px;
        background-color: var(--bg-primary);
        border-right: 1px solid var(--border-color);
        padding: 1rem;
        flex-shrink: 0;
        transition: transform 0.3s ease;
    }
    .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; }
    .sidebar-nav button {
        background: none;
        border: none;
        text-align: left;
        padding: 0.75rem 1rem;
        font-size: 0.95rem;
        font-weight: 500;
        border-radius: 8px;
        color: var(--text-secondary);
    }
    .sidebar-nav button.active {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
    }
    .sidebar-nav button:hover:not(.active) { background-color: var(--bg-hover); color: var(--text-primary); }

    .content-panel {
        flex-grow: 1;
        overflow-y: auto;
        padding: 2rem;
    }
    
    .view-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2.5rem;
    }
    .view-header h1 { font-size: 2rem; margin-bottom: 0.25rem; }
    .view-header p { color: var(--text-secondary); }

    /* --- Project/Client Cards --- */
    .projects-grid, .clients-grid, .cases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .project-card {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: border-color 0.2s ease, transform 0.2s ease;
    }
    .project-card:hover {
      border-color: var(--primary-end);
      transform: translateY(-4px);
    }
    .project-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
    .project-card-header h3 { font-size: 1.1rem; }
    .options-button { background: none; border: none; padding: 0.25rem; color: var(--text-secondary); }
    .options-button:hover { color: var(--text-primary); }
    .delete-project-button:hover { color: var(--status-rejected); }
    .project-card-description { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; }
    .project-card-meta { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.25rem; }
    .status-tag { border: none; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .due-date { display: flex; align-items: center; gap: 0.4rem; color: var(--text-secondary); font-size: 0.8rem; }
    .progress-section { margin-bottom: 1.25rem; }
    .progress-labels { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
    .progress-bar-container { width: 100%; background-color: var(--bg-tertiary); height: 6px; border-radius: 3px; overflow: hidden; }
    .progress-bar { height: 100%; background: var(--gradient-text); border-radius: 3px; }
    .project-card-footer { display: flex; justify-content: space-between; align-items: center; }
    .members-files-info { display: flex; gap: 1rem; align-items: center; }
    .info-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--text-secondary); }
    .avatar-stack { display: flex; }
    .avatar-stack img { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--bg-secondary); margin-left: -10px; }
    
    .status-in-progress { background-color: var(--status-in-progress); color: white; }
    .status-approved { background-color: var(--status-approved); color: white; }
    .status-standby { background-color: var(--status-standby); color: white; }
    .status-review { background-color: var(--status-review); color: black; }
    .status-altering { background-color: var(--status-altering); color: white; }
    .status-rejected { background-color: var(--status-rejected); color: white; }
    
    /* --- Modals --- */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .modal-content {
        background-color: var(--bg-secondary);
        border-radius: 12px;
        border: 1px solid var(--border-color);
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
    }
    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
     .modal-header h3 { font-size: 1.25rem; }
    .modal-close-button {
      background: none; border: none; font-size: 1.5rem; line-height: 1; color: var(--text-secondary);
    }
    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
    }
    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    .status-modal .modal-header { flex-direction: column; align-items: flex-start; gap: 0.25rem; }
    .status-modal .modal-header p { color: var(--text-secondary); }
    .status-modal .modal-close-button { position: absolute; top: 1.5rem; right: 1.5rem; }
    .status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .button-status { width: 100%; padding: 0.8rem; font-weight: 500; }
    .button-status.active { border-color: var(--primary-end); }

    /* --- Project Detail --- */
    .project-detail-view .panel-header, .client-detail-view .panel-header {
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .panel-header-left { display: flex; align-items: center; gap: 1rem; }
    .back-button { background: none; border: none; padding: 0.25rem; color: var(--text-secondary); }
    .back-button:hover { color: var(--text-primary); }
    .project-detail-content {
        display: grid;
        grid-template-columns: 1fr 350px;
        grid-template-areas: "kv subprojects" "kv comments";
        gap: 1.5rem;
        align-items: flex-start;
    }
    .key-visual-panel { grid-area: kv; }
    .subprojects-panel { grid-area: subprojects; }
    .comments-panel { grid-area: comments; }
    .kv-display-area {
        width: 100%;
        aspect-ratio: 16 / 9;
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        margin-bottom: 1rem;
        overflow: hidden;
    }
    .kv-display-area img { width: 100%; height: 100%; object-fit: cover; }
    .kv-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: var(--text-secondary);
    }
    .kv-placeholder span { margin-top: 1rem; font-size: 0.9rem; }
    .kv-upload-button { width: 100%; }
    
    .subprojects-panel, .comments-panel {
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1.5rem;
    }
    .subprojects-header, .comments-header { margin-bottom: 1rem; }
    .subproject-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .subproject-item { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
    .subproject-info p { font-size: 0.9rem; color: var(--text-secondary); }
    .delete-button { background: none; border: none; padding: 0.25rem; color: var(--text-secondary); }
    .delete-button:hover { color: var(--status-rejected); }
    .add-subproject-button { width: 100%; }

    .comment-list { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 1.5rem; max-height: 250px; overflow-y: auto; }
    .comment-item { display: flex; gap: 0.75rem; }
    .comment-avatar { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; }
    .comment-author-time { display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.25rem; }
    .comment-author-time span { font-size: 0.75rem; color: var(--text-secondary); }
    .comment-content p { font-size: 0.9rem; }
    .comment-form { display: flex; gap: 0.5rem; }
    .comment-form textarea { flex-grow: 1; }
    
    .empty-state-small { font-size: 0.9rem; color: var(--text-secondary); text-align: center; padding: 1rem 0; }

    /* Feed View */
    .activity-list { max-width: 800px; margin: 0 auto; }
    .activity-item { display: flex; gap: 1rem; padding: 1.25rem; border-bottom: 1px solid var(--border-color); }
    .activity-avatar { width: 40px; height: 40px; border-radius: 50%; }
    .activity-content p { color: var(--text-secondary); }
    .activity-content p strong { color: var(--text-primary); }
    .activity-content p strong[onclick] { cursor: pointer; }
    .activity-content p strong[onclick]:hover { text-decoration: underline; color: var(--primary-start); }
    .activity-timestamp { font-size: 0.8rem; color: var(--text-secondary); }
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background-color: var(--bg-secondary);
        border: 1px dashed var(--border-color);
        border-radius: 12px;
    }
    .empty-state h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .empty-state p { color: var(--text-secondary); }

    /* Clients View */
    .client-card {
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.2s ease, transform 0.2s ease;
    }
    .client-card:hover {
        border-color: var(--primary-end);
        transform: translateY(-4px);
    }
    .client-logo {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        margin-bottom: 1rem;
        object-fit: contain;
        background-color: white;
    }
    .client-card h4 { font-size: 1.1rem; margin-bottom: 0.25rem; }
    .client-card p { color: var(--text-secondary); font-size: 0.9rem; }

    /* Client Detail View */
    .client-detail-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .client-logo-container { position: relative; }
    .client-detail-logo {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background-color: white;
      object-fit: contain;
      border: 3px solid var(--bg-tertiary);
    }
    .upload-logo-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      padding: 0;
    }
    .upload-logo-btn:hover { background-color: var(--bg-hover); }
    .client-contact-info { display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); }
    .client-contact-info a { color: var(--text-secondary); text-decoration: none; }
    .client-contact-info a:hover { color: var(--primary-start); }
    
    .client-detail-content {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 2rem;
        align-items: flex-start;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.75rem;
    }
    .asset-list { display: flex; flex-direction: column; gap: 1rem; }
    .asset-item { display: flex; align-items: center; gap: 0.75rem; }
    .asset-item svg { flex-shrink: 0; }
    .asset-info { overflow: hidden; }
    .asset-info a {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text-primary);
      text-decoration: none;
      font-size: 0.9rem;
    }
    .asset-info a:hover { text-decoration: underline; color: var(--primary-start); }
    .asset-info span { font-size: 0.8rem; color: var(--text-secondary); }

    /* Cases View */
    .case-card {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }
    .case-card-kv {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }
    .case-card-content { padding: 1.5rem; }
    .case-card-content h4 { font-size: 1.1rem; margin-bottom: 0.25rem; }
    .case-card-content p { color: var(--text-secondary); margin-bottom: 1rem; }
    
    /* Team View */
    .team-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: flex-start;
    }
    .member-list-container h4, .permissions-container h4 {
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    .member-list { list-style: none; }
    .member-list li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      border-radius: 8px;
      cursor: pointer;
    }
    .member-list li:hover { background-color: var(--bg-secondary); }
    .member-info { display: flex; align-items: center; gap: 0.75rem; }
    .member-info img { width: 40px; height: 40px; border-radius: 50%; }
    .member-info div { display: flex; flex-direction: column; }
    .member-info span { font-size: 0.85rem; color: var(--text-secondary); }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .status-dot.online { background-color: var(--status-approved); }
    .status-dot.offline { background-color: var(--text-secondary); }
    .permissions-list { list-style: none; display: flex; flex-direction: column; gap: 1rem; }
    .permissions-list p { font-size: 0.9rem; color: var(--text-secondary); }

    /* Member Profile */
    .team-member-profile-view { max-width: 600px; margin: 0 auto; }
    .profile-header { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; margin-bottom: 2rem; }
    .profile-avatar-container { position: relative; margin-bottom: 0.5rem; }
    .profile-avatar { width: 120px; height: 120px; border-radius: 50%; border: 3px solid var(--bg-tertiary); }
    .upload-avatar-btn {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      padding: 0;
    }
    .profile-role { color: var(--text-secondary); }
    .profile-form-container .form-actions { justify-content: flex-start; margin-top: 1.5rem; }
    
    /* Admin Dashboard */
    .admin-dashboard { height: 100vh; display: flex; flex-direction: column; }
    .admin-header {
      padding: 1rem 2rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .admin-content { padding: 2rem; flex-grow: 1; overflow-y: auto; }
    .agency-list-container {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
    }
    .agency-table { width: 100%; border-collapse: collapse; }
    .agency-table th, .agency-table td {
      padding: 1rem 1.5rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    .agency-table th { font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); }
    .agency-table tbody tr:last-child td { border-bottom: none; }
    .delete-agency-button {
      background: none; border: none; padding: 0.25rem; color: var(--text-secondary);
    }
    .delete-agency-button:hover { color: var(--status-rejected); }

    /* Responsive */
    @media (max-width: 992px) {
      .project-detail-content {
        grid-template-columns: 1fr;
        grid-template-areas: "kv" "subprojects" "comments";
      }
      .team-content, .client-detail-content {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        height: 100%;
        z-index: 1001;
        transform: translateX(-100%);
        padding-top: 5rem;
      }
      .sidebar.open { transform: translateX(0); }
      .sidebar-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0,0,0,0.5);
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .sidebar-overlay.visible {
        opacity: 1;
        pointer-events: auto;
      }
      .hamburger-menu { display: block; }
      .user-name { display: none; }
      .content-panel { padding: 1.5rem; }
      .view-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }
      .projects-grid, .clients-grid, .cases-grid {
        grid-template-columns: 1fr;
      }
    }
    `;

    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = css;
        document.head.appendChild(styleElement);
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    return null;
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
