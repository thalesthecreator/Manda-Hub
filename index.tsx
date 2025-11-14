// FIX: Add global declaration for jspdf to avoid TypeScript errors.
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
    progress: 10,
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
        const stickyValue = window.localStorage.getItem(key);
        // A little trick to parse dates correctly from JSON
        const parsedValue = stickyValue !== null ? JSON.parse(stickyValue, (k, v) => {
            if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v)) {
                return new Date(v);
            }
            return v;
        }) : defaultValue;
        return parsedValue;
    });

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
};

const App = () => {
    const [users, setUsers] = useStickyState([], 'users');
    const [currentUser, setCurrentUser] = useStickyState(null, 'currentUser');
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

    const handleLogout = () => {
        setCurrentUser(null);
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
    
    useEffect(() => {
        if(activeTab !== 'projects-detail') {
            setSelectedProject(null);
        }
    }, [activeTab]);

    if (!currentUser) {
        return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} usersExist={users.length > 0} />;
    }
    
    return (
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
    );
};

const AuthScreen = ({ onLogin, onRegister, usersExist }) => {
    const [isLoginView, setIsLoginView] = useState(usersExist);

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [agencyName, setAgencyName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) return;
        onLogin({ email: loginEmail, password: loginPassword });
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        if (!agencyName.trim() || !ownerName.trim() || !ownerEmail.trim() || !password.trim()) return;
        onRegister({ agencyName, ownerName, ownerEmail, password });
    };

    // FIX: Explicitly type SwitchModeButton as a React Functional Component to define its props, including 'children'.
    const SwitchModeButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
        <button type="button" onClick={onClick} className="switch-auth-mode-button">
            {children}
        </button>
    );

    return (
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
    
    // FIX: Explicitly type ActivityItem as a React Functional Component to allow the 'key' prop.
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
                {feed.map(item => <ActivityItem key={item.id} item={item} />)}
            </div>
        </div>
    );
};


// FIX: Explicitly type ProjectCard as a React Functional Component to allow the 'key' prop.
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
        onOpenStatusModal();
    };
    
    return (
        <div className="project-card" onClick={onClick}>
            <div className="project-card-header">
                <h3>{name}</h3>
                <button onClick={(e) => { e.stopPropagation(); /* TODO: Implement dropdown menu */ }} className="options-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
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

    const handleExportPDF = async () => {
        if (!window.jspdf) {
            alert("PDF library not loaded. Please try again.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let y = margin;
    
        const addText = (text, size, isBold, yPos) => {
            if (yPos > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
            }
            doc.setFontSize(size);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
            doc.text(lines, margin, yPos);
            return yPos + (lines.length * (size * 0.35)) + 5;
        };
    
        y = addText(project.name, 22, true, y);
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
                    doc.addPage();
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
                doc.addPage();
                y = margin;
            }
            y = addText('Subprojetos / Desdobramentos', 18, true, y);
    
            project.subprojects.forEach(sp => {
                if (y > pageHeight - margin - 20) {
                     doc.addPage();
                     y = margin;
                }
                y = addText(sp.name, 14, true, y);
                y = addText(sp.description, 11, false, y);
                y += 5;
            });
        }
    
        doc.save(`${project.name.replace(/\s/g, '_')}.pdf`);
    };

    return (
        <section className="project-detail-view">
            <div className="panel-header">
                <div className="panel-header-left">
                     <button onClick={onBack} className="back-button" title="Voltar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <h4>{project.name}</h4>
                </div>
                 <div className="panel-header-right">
                    <button onClick={handleExportPDF} className="button-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Exportar PDF
                    </button>
                </div>
            </div>
            <div className="project-detail-content">
                <div className="key-visual-panel">
                    <div className="kv-display-area">
                        {project.keyVisual 
                            ? <img src={project.keyVisual} alt="Key Visual" /> 
                            : <div className="kv-placeholder"></div>
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
          <img src={file.content} alt={`Preview of ${file.name}`} />
        ) : (
          <div className="non-image-preview">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
            <h4>{file.name}</h4>
            <p>Não é possível pré-visualizar este tipo de arquivo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateProjectModal = ({ clients, onCreateProject, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('Em Andamento');
    const [clientId, setClientId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !clientId || !dueDate) return;
        onCreateProject({ name, description, dueDate, status, clientId });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-project-modal" onClick={(e) => e.stopPropagation()}>
                <header className="create-project-modal-header">
                    <h3 className="gradient-text">Novo Projeto</h3>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="projectName">Nome do Projeto</label>
                        <input
                            type="text"
                            id="projectName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Website Redesign"
                            required
                        />
                    </div>
                     <div className="form-group">
                        <label htmlFor="projectClient">Cliente</label>
                        <select
                            id="projectClient"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            required
                        >
                            <option value="" disabled>Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="projectDescription">Descrição</label>
                        <textarea
                            id="projectDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva o projeto..."
                            rows={3}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="projectDueDate">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            Data de Entrega
                        </label>
                        <input
                            type="date"
                            id="projectDueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="projectStatus">Status</label>
                        <select
                            id="projectStatus"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option>Planejado</option>
                            <option>Em Andamento</option>
                            <option>Em Revisão</option>
                            <option>Pausado</option>
                            <option>Concluído</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="button-secondary">Cancelar</button>
                        <button type="submit" className="button-primary" disabled={!name.trim() || !clientId || !dueDate}>Criar Projeto</button>
                    </div>
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
        if (!name.trim()) return;
        onCreateSubproject({ name, description });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-project-modal" onClick={(e) => e.stopPropagation()}>
                <header className="create-project-modal-header">
                    <h3 className="gradient-text">Novo Subprojeto</h3>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="subprojectName">Título do Subprojeto</label>
                        <input
                            type="text"
                            id="subprojectName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Peça para Instagram"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="subprojectDescription">Descrição</label>
                        <textarea
                            id="subprojectDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva a peça ou tarefa..."
                            rows={3}
                        ></textarea>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="button-secondary">Cancelar</button>
                        <button type="submit" className="button-primary" disabled={!name.trim()}>Criar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RegisterMemberModal = ({ onRegisterMember, onClose }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('Developer');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !password.trim()) return;
        onRegisterMember({ name, role, email });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-project-modal" onClick={(e) => e.stopPropagation()}>
                <header className="create-project-modal-header">
                    <h3 className="gradient-text">Cadastrar Membro</h3>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="memberName">Nome Completo</label>
                        <input
                            type="text"
                            id="memberName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: João da Silva"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="memberRole">Função</label>
                        <select
                            id="memberRole"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option>Developer</option>
                            <option>Designer</option>
                            <option>Owner</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="memberEmail">E-mail</label>
                        <input
                            type="email"
                            id="memberEmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="joao.silva@email.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="memberPassword">Senha</label>
                        <input
                            type="password"
                            id="memberPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="button-secondary">Cancelar</button>
                        <button type="submit" className="button-primary" disabled={!name.trim() || !email.trim() || !password.trim()}>Cadastrar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UpdateStatusModal = ({ project, stati, onUpdateStatus, onClose }) => {
    const [selectedStatus, setSelectedStatus] = useState(project.status);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdateStatus(project.id, selectedStatus);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-project-modal" onClick={(e) => e.stopPropagation()}>
                <header className="create-project-modal-header">
                    <div>
                        <h3 className="gradient-text">Alterar Status</h3>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{project.name}</p>
                    </div>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="form-group status-radio-group">
                        <label>Selecione o novo status</label>
                        {stati.map(status => (
                            <div key={status} className="radio-option">
                                <input
                                    type="radio"
                                    id={`status-${status.replace(/\s+/g, '-')}`}
                                    name="projectStatus"
                                    value={status}
                                    checked={selectedStatus === status}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                />
                                <label htmlFor={`status-${status.replace(/\s+/g, '-')}`}>{status}</label>
                            </div>
                        ))}
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="button-secondary">Cancelar</button>
                        <button type="submit" className="button-primary">Atualizar Status</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CasesView = ({ projects, clients, onExportCase }) => {
    const approvedProjects = projects.filter(p => p.status === 'Aprovado');

    return (
        <div className="cases-view">
            <div className="view-header">
                <div>
                    <h1 className="gradient-text">Cases de Sucesso</h1>
                    <p>Um portfólio dos seus melhores projetos finalizados</p>
                </div>
            </div>
            {approvedProjects.length > 0 ? (
                <div className="cases-grid">
                    {approvedProjects.map(project => (
                        <CaseCard 
                            key={project.id}
                            project={project}
                            client={clients.find(c => c.id === project.clientId)}
                            onExport={() => onExportCase(project)}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <h3>Nenhum case para mostrar</h3>
                    <p>Projetos com o status "Aprovado" aparecerão aqui automaticamente.</p>
                </div>
            )}
        </div>
    );
};

const CaseCard: React.FC<{ project: any; client: any; onExport: () => void; }> = ({ project, client, onExport }) => {
    return (
        <div className="case-card">
            <div className="case-card-image">
                {project.keyVisual ? (
                    <img src={project.keyVisual} alt={`Key visual for ${project.name}`} />
                ) : (
                    <div className="kv-placeholder-case">
                        <span>Sem KV</span>
                    </div>
                )}
            </div>
            <div className="case-card-content">
                <div className="case-card-info">
                    <h3>{project.name}</h3>
                    <p>{client?.name || 'Cliente desconhecido'}</p>
                </div>
                <div className="case-card-actions">
                    <button onClick={onExport} className="button-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Exportar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

const FileDropzone: React.FC<{onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ onFileUpload }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="file-dropzone" onClick={() => inputRef.current?.click()}>
            <input type="file" ref={inputRef} onChange={onFileUpload} style={{ display: 'none' }} multiple />
            <div className="dropzone-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="dropzone-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <p className="dropzone-text"><strong>Arraste e solte seus arquivos aqui</strong></p>
                <p className="dropzone-subtext">Ou clique para selecionar arquivos do seu computador</p>
                <p className="dropzone-supported-files">Suporte para Figma, Sketch, Adobe XD, PDF, imagens e vídeos</p>
            </div>
        </div>
    );
};

const TeamView = ({ members, permissions, onRegisterClick, onMemberSelect }) => (
    <div className="team-view">
        <div className="view-header">
            <div>
                <h1 className="gradient-text">Equipe</h1>
                <p>Gerencie os membros da sua equipe de design</p>
            </div>
            <button onClick={onRegisterClick} className="button-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
                Cadastrar Membro
            </button>
        </div>
        <div className="team-content-grid">
            <div className="team-card">
                <div className="team-card-header">
                    <h2>Membros da Equipe</h2>
                    <span>{members.length}/{members.length} membros</span>
                </div>
                <div className="team-members-list">
                    {members.map(member => <TeamMemberItem key={member.id} member={member} onSelect={onMemberSelect} />)}
                </div>
            </div>
            <div className="team-card">
                 <div className="team-card-header">
                    <h2>Permissões da Equipe</h2>
                </div>
                <div className="permissions-list">
                    {permissions.map(p => (
                        <div key={p.role} className="permission-item">
                            <div className="permission-icon"><RoleIcon role={p.role} /></div>
                            <div className="permission-details">
                                <h3>{p.role}</h3>
                                <p>{p.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// FIX: Explicitly type TeamMemberItem as a React Functional Component to allow the 'key' prop.
const TeamMemberItem: React.FC<{ member: any; onSelect: (member: any) => void; }> = ({ member, onSelect }) => (
    <div className="team-member-item" onClick={() => onSelect(member)}>
        <div className="member-info">
            <div className="avatar-wrapper">
                <img src={member.avatarUrl} alt={member.name} className="avatar" />
                <span className={`status-indicator ${member.status.toLowerCase()}`}></span>
            </div>
            <div className="member-details">
                <div className="member-name-role">
                    <span className="member-name">{member.name}</span>
                    <span className="role-tag">
                        <RoleIcon role={member.role} />
                        {member.role}
                    </span>
                </div>
                 <div className="member-email-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <span className="member-email">{member.email}</span>
                </div>
            </div>
        </div>
        <div className="member-actions">
            <span className={`status-badge status-${member.status.toLowerCase()}`}>{member.status}</span>
             <button className="options-button" onClick={(e) => e.stopPropagation()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </button>
        </div>
    </div>
);


const TeamMemberProfileView: React.FC<{ member: any; clients: any[]; onBack: () => void; onUpdateProfile: (memberId: string, data: any) => void; onAvatarUpload: (memberId: string, file: File) => void; }> = ({ member, clients, onBack, onUpdateProfile, onAvatarUpload }) => {
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingRole, setIsEditingRole] = useState(false);
    const [name, setName] = useState(member.name);
    const [role, setRole] = useState(member.role);

    const handleNameBlur = () => {
        setIsEditingName(false);
        if (name.trim() && name !== member.name) {
            onUpdateProfile(member.id, { name });
        } else {
            setName(member.name);
        }
    };

    const handleRoleBlur = () => {
        setIsEditingRole(false);
        if (role.trim() && role !== member.role) {
            onUpdateProfile(member.id, { role });
        } else {
            setRole(member.role);
        }
    };

    const handleClientAssignmentChange = (clientId, isChecked) => {
        const currentAssigned = member.assignedClients || [];
        const newAssigned = isChecked
            ? [...currentAssigned, clientId]
            : currentAssigned.filter(id => id !== clientId);
        onUpdateProfile(member.id, { assignedClients: newAssigned });
    };

    const assignedClientDetails = (member.assignedClients || []).map(id => clients.find(c => c.id === id)).filter(Boolean);

    return (
        <div className="team-member-profile-view">
            <div className="panel-header">
                <div className="panel-header-left">
                    <button onClick={onBack} className="back-button" title="Voltar para a equipe">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <h4>Perfil do Membro</h4>
                </div>
            </div>
            <div className="profile-content">
                <div className="profile-header-card">
                    <div className="profile-avatar-container">
                        <img src={member.avatarUrl} alt={member.name} className="profile-avatar" />
                        <button className="avatar-upload-button" onClick={() => avatarInputRef.current?.click()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        </button>
                        <input type="file" ref={avatarInputRef} onChange={(e) => onAvatarUpload(member.id, e.target.files[0])} style={{ display: 'none' }} accept="image/*" />
                    </div>
                    <div className="profile-info">
                        {isEditingName ? (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={handleNameBlur}
                                onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
                                autoFocus
                                className="profile-name-input"
                            />
                        ) : (
                            <h2 className="profile-name" onClick={() => setIsEditingName(true)}>{member.name}</h2>
                        )}
                         {isEditingRole ? (
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                onBlur={handleRoleBlur}
                                onKeyDown={(e) => e.key === 'Enter' && handleRoleBlur()}
                                autoFocus
                                className="profile-role-input"
                            />
                        ) : (
                             <p className="profile-role" onClick={() => setIsEditingRole(true)}>{member.role}</p>
                        )}
                        <div className="member-email-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            <span className="member-email">{member.email}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-clients-card">
                    <div className="team-card-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)'}}>
                        <h2>Clientes Atendidos</h2>
                    </div>
                    <div className="client-assignment-section">
                        <div className="assigned-clients-list">
                            {assignedClientDetails.length > 0 ? (
                                assignedClientDetails.map(client => (
                                    <div key={client.id} className="assigned-client-item">
                                        <img src={client.logoUrl} alt={client.name} className="assigned-client-logo" />
                                        <span>{client.name}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-state-small" style={{padding: '1rem 0'}}>Nenhum cliente atribuído.</p>
                            )}
                        </div>
                        <div className="available-clients-list">
                            <h3>Atribuir clientes</h3>
                            {clients.map(client => (
                                <div key={client.id} className="client-checkbox-item">
                                    <input
                                        type="checkbox"
                                        id={`client-assign-${client.id}`}
                                        checked={(member.assignedClients || []).includes(client.id)}
                                        onChange={(e) => handleClientAssignmentChange(client.id, e.target.checked)}
                                    />
                                    <label htmlFor={`client-assign-${client.id}`}>{client.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const RoleIcon = ({ role }) => {
    switch (role) {
        case 'Owner':
            return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#F59E0B' }}><path d="M2 4l3 12h14l3-12-10 6z"></path></svg>;
        case 'Designer':
            return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#22D3EE' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>;
        case 'Developer':
            return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#A78BFA' }}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;
        default:
            return null;
    }
};

const ClientsView = ({ clients, onClientSelect, onCreateClient }) => (
    <div className="clients-view">
        <div className="view-header">
            <div>
                <h1 className="gradient-text">Clientes</h1>
                <p>Gerencie todos os seus clientes</p>
            </div>
            <button onClick={onCreateClient} className="button-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Cadastrar Cliente
            </button>
        </div>
        <div className="client-grid">
            {clients.map(c => <ClientCard key={c.id} client={c} onClick={() => onClientSelect(c)} />)}
        </div>
    </div>
);

// FIX: Explicitly type ClientCard as a React Functional Component to allow the 'key' prop.
const ClientCard: React.FC<{ client: any; onClick: any }> = ({ client, onClick }) => (
    <div className="client-card" onClick={onClick}>
        <div className="client-card-logo-wrapper">
            <img src={client.logoUrl} alt={`${client.name} logo`} className="client-card-logo" />
        </div>
        <div className="client-card-info">
            <h3>{client.name}</h3>
            <p>{client.contactPerson}</p>
        </div>
    </div>
);

const ClientDetailView = ({ client, projects, files, onBack, onProjectSelect, onDeleteProject, onOpenStatusModal, onCreateProject, clientAssets, onLogoUpload, onAssetUpload }) => {
    const [activeDetailTab, setActiveDetailTab] = useState('projects');
    const logoInputRef = useRef<HTMLInputElement>(null);
    
    return (
        <div className="client-detail-view">
            <div className="panel-header">
                <div className="panel-header-left">
                     <button onClick={onBack} className="back-button" title="Voltar aos clientes">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <div className="client-detail-header-info">
                         <button className="client-logo-upload-trigger" onClick={() => logoInputRef.current?.click()} title="Trocar logo">
                            <img src={client.logoUrl} alt={`${client.name} logo`} />
                            <div className="logo-upload-overlay">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                            </div>
                        </button>
                        <input type="file" ref={logoInputRef} onChange={(e) => onLogoUpload(client.id, e.target.files[0])} style={{ display: 'none' }} accept="image/*" />
                        <h4>{client.name}</h4>
                    </div>
                </div>
                 <div className="panel-header-right">
                    <button onClick={onCreateProject} className="button-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Novo Projeto
                    </button>
                </div>
            </div>
            <div className="client-info-bar">
                <div><span>Contato:</span> {client.contactPerson}</div>
                <div><span>Email:</span> {client.email}</div>
                <div><span>Telefone:</span> {client.phone}</div>
            </div>
            
            <div className="client-detail-tabs">
                <button className={`tab-button ${activeDetailTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveDetailTab('projects')}>Projetos</button>
                <button className={`tab-button ${activeDetailTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveDetailTab('assets')}>Assets</button>
            </div>

            <div className="client-detail-tab-content">
                {activeDetailTab === 'projects' && (
                    <>
                        <h2 className="client-projects-title">Projetos do Cliente</h2>
                        <div className="project-grid">
                            {projects.map(p => (
                                <ProjectCard 
                                    key={p.id}
                                    project={p}
                                    filesCount={files.filter(f => f.projectId === p.id).length}
                                    subprojectsCount={p.subprojects?.length || 0}
                                    onDeleteProject={onDeleteProject}
                                    onClick={() => onProjectSelect(p)}
                                    onOpenStatusModal={() => onOpenStatusModal(p)}
                                />
                            ))}
                        </div>
                    </>
                )}
                 {activeDetailTab === 'assets' && (
                    <ClientAssetsView
                        assets={clientAssets}
                        clientId={client.id}
                        onAssetUpload={onAssetUpload}
                    />
                )}
            </div>
        </div>
    );
};

const ClientAssetsView: React.FC<{ assets: any[]; clientId: string; onAssetUpload: (clientId: string, file: File) => void; }> = ({ assets, clientId, onAssetUpload }) => {
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(file => onAssetUpload(clientId, file));
        }
        if (e.target) e.target.value = null; // Reset input
    };

    return (
        <div className="client-assets-view">
            <h2 className="client-projects-title">Assets do Cliente</h2>
            <FileDropzone onFileUpload={handleFileSelect} />
            <div className="asset-list">
                {assets.length === 0 ? (
                    <p className="empty-state-small" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>Nenhum asset cadastrado para este cliente.</p>
                ) : (
                    assets.map(asset => <AssetListItem key={asset.id} asset={asset} />)
                )}
            </div>
        </div>
    );
};

const AssetListItem: React.FC<{ asset: any }> = ({ asset }) => {
    return (
        <div className="file-list-item">
            <div className="file-info">
                <div className="file-icon">{getFileIcon(asset.type)}</div>
                <div>
                    <p className="file-name">{asset.name}</p>
                    <p className="file-size">{asset.size}</p>
                </div>
            </div>
            <div className="file-meta">
                 <div className="file-date-info">
                    <p className="meta-label">Enviado em:</p>
                    <p className="meta-value">{new Date(asset.uploadedAt).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="file-actions">
                <a href={asset.url} download={asset.name} className="button-download" style={{textDecoration: 'none'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span>Download</span>
                </a>
            </div>
        </div>
    );
};


const CreateClientModal = ({ onCreateClient, onClose }) => {
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreateClient({ name, contactPerson, email, phone, logoUrl });
    };

    return (
         <div className="modal-overlay" onClick={onClose}>
            <div className="create-project-modal" onClick={(e) => e.stopPropagation()}>
                <header className="create-project-modal-header">
                    <h3 className="gradient-text">Cadastrar Cliente</h3>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="clientName">Nome da Empresa</label>
                        <input type="text" id="clientName" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="contactPerson">Nome do Contato</label>
                        <input type="text" id="contactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="clientEmail">Email de Contato</label>
                        <input type="email" id="clientEmail" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="clientPhone">Telefone de Contato</label>
                        <input type="tel" id="clientPhone" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="clientLogo">URL do Logo</label>
                        <input type="text" id="clientLogo" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="button-secondary">Cancelar</button>
                        <button type="submit" className="button-primary" disabled={!name.trim()}>Cadastrar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const styles = `
:root {
  --background: #000000;
  --surface: #121212;
  --card-bg: #1E1E1E;
  --subproject-card-bg: #282828;
  --primary-start: #34D399;
  --primary-end: #10B981;
  --text-primary: #E5E7EB;
  --text-secondary: #9CA3AF;
  --border-color: #374151;
  --danger: #EF4444;
  --online: #10B981;
  --offline: #6B7280;
}
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--surface);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#root { height: 100vh; }

.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: var(--background);
}
.auth-modal {
    background-color: #242424;
    padding: 2.5rem 2rem;
    border-radius: 12px;
    width: 100%;
    max-width: 450px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
}
.auth-modal-header {
    text-align: center;
    margin-bottom: 2rem;
}
.auth-modal-header h3 {
    margin: 0;
    font-size: 1.75rem;
}
.auth-modal-header p {
    margin: 8px 0 0;
    color: var(--text-secondary);
}
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
    font-weight: 500;
    cursor: pointer;
    font-size: 0.9rem;
}
.switch-auth-mode-button:hover {
    text-decoration: underline;
}

.app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}
.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5rem;
    height: 60px;
    background-color: var(--background);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
    color: var(--text-primary);
}
.logo-section { display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); }
.logo-section h3 { font-weight: 600; font-size: 1.25rem; }
.user-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}
.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
}
.user-name {
    font-weight: 500;
    font-size: 0.9rem;
}
.logout-button {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}
.logout-button:hover {
    background: #374151;
    color: var(--text-primary);
}


.main-content {
    display: flex;
    flex-grow: 1;
    overflow: hidden;
}
.sidebar {
    width: 260px;
    background-color: var(--background);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    transition: width 0.3s ease-in-out;
}
.sidebar-nav {
    padding: 1rem;
}
.sidebar-nav button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem;
    border-radius: 8px;
    border: none;
    background-color: transparent;
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
    text-align: left;
}
.sidebar-nav button:hover {
    background-color: #1F2937;
    color: var(--text-primary);
}
.sidebar-nav button.active {
    background: linear-gradient(to right, var(--primary-end), var(--primary-start));
    color: white;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
}
.sidebar-nav button svg { flex-shrink: 0; }
.sidebar-nav button + button { margin-top: 0.5rem; }

.content-panel {
    flex-grow: 1;
    overflow-y: auto;
    background-color: var(--surface);
}

.view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}
.view-header h1 {
    font-size: 2.25rem;
    margin: 0;
}
.view-header p {
    margin: 0.25rem 0 0;
    color: var(--text-secondary);
    font-size: 1rem;
}
.view-header .button-primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Projects Feed View */
.projects-feed-view {
    padding: 2.5rem;
}
.activity-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
.activity-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}
.activity-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}
.activity-content p {
    margin: 0;
    line-height: 1.6;
}
.activity-content p strong {
    color: var(--text-primary);
    font-weight: 600;
}
.activity-content p strong:hover {
    text-decoration: underline;
    cursor: pointer;
    color: var(--primary-start);
}
.activity-content p em {
    font-style: normal;
    background-color: var(--subproject-card-bg);
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
}
.activity-timestamp {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
    display: block;
}

/* Project Grid (reusable) */
.project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}

/* Project Card */
.project-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06);
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}
.project-card:hover {
    transform: translateY(-4px);
    border-color: var(--primary-end);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}
.project-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}
.project-card-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
}
.options-button {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
}
.project-card-description {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.5;
    flex-grow: 1;
}
.project-card-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.status-tag {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    border: none;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}
.status-tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
.status-in-progress { background-color: #164E63; color: #A5F3FC; }
.status-approved { background-color: #065F46; color: #A7F3D0; }
.status-standby { background-color: #78350F; color: #FEF08A; }
.status-review { background-color: #86198F; color: #F5D0FE; }
.status-altering { background-color: #9A3412; color: #FDE68A; }
.status-rejected { background-color: #991B1B; color: #FECACA; }
.status-planned { background-color: #374151; color: #D1D5DB; }

.due-date {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}
.progress-section { margin-top: 0.5rem; }
.progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
}
.progress-bar-container {
    width: 100%;
    background-color: var(--border-color);
    border-radius: 9999px;
    height: 8px;
    overflow: hidden;
}
.progress-bar {
    height: 100%;
    background: linear-gradient(to right, var(--primary-end), var(--primary-start));
    border-radius: 9999px;
}
.project-card-footer {
    border-top: 1px solid var(--border-color);
    padding-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.members-files-info { display: flex; flex-wrap: wrap; gap: 1rem; }
.info-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}
.avatar-stack { display: flex; }
.avatar-stack img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--card-bg);
    margin-left: -10px;
}
.avatar-stack img:first-child { margin-left: 0; }

/* Project Detail View */
.project-detail-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 2.5rem;
    box-sizing: border-box;
}
.project-detail-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    flex-grow: 1;
    gap: 2.5rem;
    overflow: hidden;
}
.key-visual-panel {
    grid-column: span 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.kv-display-area {
    width: 100%;
    flex-grow: 1;
    background-color: #333333;
    border: 1px solid rgba(128, 128, 128, 0.2);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.kv-placeholder {
    width: 100%;
    height: 100%;
    background-color: #333333;
}
.kv-display-area img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
.kv-upload-button {
    background: var(--primary-end);
    flex-shrink: 0;
    max-width: 300px;
    align-self: center;
}

.subprojects-panel {
    grid-column: span 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 0;
}
.subprojects-header {
    margin-bottom: 0.5rem;
    flex-shrink: 0;
}
.subprojects-header h5 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
}
.subproject-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    flex-grow: 1;
    padding-right: 8px; /* For scrollbar */
}
.add-subproject-button {
    width: 100%;
    justify-content: center;
    flex-shrink: 0;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-shrink: 0;
}
.panel-header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.panel-header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.panel-header h4 { margin: 0; font-size: 1.5rem; font-weight: 600; }
.back-button {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s;
}
.back-button:hover {
    background: #374151;
    color: var(--text-primary);
}
.empty-state, .empty-state-small {
    color: var(--text-secondary);
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    border: 2px dashed var(--border-color);
    border-radius: 8px;
}
.empty-state-small {
    padding: 1.5rem;
    font-size: 0.875rem;
}
.delete-button {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    line-height: 0;
    transition: all 0.2s;
}
.delete-button:hover {
    background-color: var(--danger);
    color: white;
}

.button-secondary-small {
    background-color: var(--card-bg);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.875rem;
}
.button-secondary-small:hover {
    background-color: #374151;
    color: var(--text-primary);
}
.subproject-item {
    background-color: var(--subproject-card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}
.subproject-info strong {
    color: var(--text-primary);
    font-weight: 600;
}
.subproject-info p {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

/* Comments Panel */
.comments-panel {
    grid-column: span 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 0;
}
.comments-header h5 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
}
.comment-list {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-right: 8px;
}
.comment-item {
    display: flex;
    gap: 0.75rem;
}
.comment-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
}
.comment-content p {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: var(--text-primary);
    line-height: 1.5;
    white-space: pre-wrap;
}
.comment-author-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.comment-author-time strong {
    font-size: 0.875rem;
    font-weight: 600;
}
.comment-author-time span {
    font-size: 0.75rem;
    color: var(--text-secondary);
}
.comment-form {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.comment-form textarea {
    background-color: var(--subproject-card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.75rem;
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    resize: vertical;
}
.comment-form textarea:focus {
    outline: none;
    border-color: var(--primary-end);
}
.button-primary-small {
    background: linear-gradient(to right, var(--primary-end), var(--primary-start));
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    align-self: flex-end;
}
.button-primary-small:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Clients View */
.clients-view {
    padding: 2.5rem;
}
.client-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}
.client-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}
.client-card:hover {
    transform: translateY(-4px);
    border-color: var(--primary-end);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}
.client-card-logo-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 2px solid var(--border-color);
}
.client-card-logo {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.client-card-info h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
}
.client-card-info p {
    margin: 0.25rem 0 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
}

/* Client Detail View */
.client-detail-view {
    padding: 2.5rem;
}
.client-detail-header-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.client-logo-upload-trigger {
    position: relative;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 8px;
    overflow: hidden;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
}
.client-logo-upload-trigger img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: #fff;
    padding: 4px;
    border-radius: 8px;
    box-sizing: border-box;
}
.logo-upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.6);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
}
.client-logo-upload-trigger:hover .logo-upload-overlay {
    opacity: 1;
}

.client-info-bar {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem 1.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
}
.client-info-bar div span {
    color: var(--text-secondary);
    margin-right: 0.5rem;
}
.client-detail-tabs {
    display: flex;
    gap: 0.5rem;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 2.5rem;
}
.tab-button {
    padding: 0.75rem 1.25rem;
    border: none;
    background: none;
    color: var(--text-secondary);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    top: 1px; /* Aligns with border */
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}
.tab-button:hover {
    color: var(--text-primary);
}
.tab-button.active {
    color: var(--primary-start);
    border-bottom-color: var(--primary-start);
}
.client-projects-title {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
}

/* Client Assets View */
.client-assets-view .asset-list {
    display: grid;
    gap: 1rem;
    margin-top: 2rem;
}

/* Cases View */
.cases-view {
    padding: 2.5rem;
}
.cases-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 2rem;
}
.case-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    transition: all 0.2s ease-in-out;
}
.case-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    border-color: var(--primary-start);
}
.case-card-image {
    width: 100%;
    aspect-ratio: 16 / 10;
    background-color: var(--subproject-card-bg);
}
.case-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.kv-placeholder-case {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
}
.case-card-content {
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}
.case-card-info h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
}
.case-card-info p {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
}
.case-card-actions .button-secondary {
    padding: 0.5rem 1rem;
}

/* Files View (Old, now used by Assets) */
.file-dropzone {
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    padding: 2.5rem;
    text-align: center;
    background-color: var(--card-bg);
    margin-bottom: 2.5rem;
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;
}
.file-dropzone:hover {
    border-color: var(--primary-end);
    background-color: #2a2a2a;
}
.dropzone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}
.dropzone-icon {
    color: var(--primary-end);
}
.dropzone-text {
    font-size: 1rem;
    color: var(--text-primary);
    margin: 0;
}
.dropzone-subtext {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
}
.dropzone-supported-files {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.75rem;
}

/* File List Item (for Assets) */
.file-list-item {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    display: grid;
    grid-template-columns: 2fr 1.5fr auto;
    align-items: center;
    gap: 1.5rem;
}
.file-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0; /* Prevents text overflow issues */
}
.file-icon {
    flex-shrink: 0;
}
.file-name {
    font-weight: 500;
    color: var(--text-primary);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.file-size {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
}
.file-meta {
    display: flex;
    gap: 2rem;
    min-width: 0;
}
.meta-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
}
.meta-value {
    font-size: 0.875rem;
    color: var(--text-primary);
    margin: 0;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.file-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.5rem;
}
.button-download, .button-open {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    color: var(--text-primary);
}
.button-download:hover { background-color: #374151; }
.button-open {
    padding: 0.5rem;
    line-height: 0;
}

/* Team View */
.team-view {
    padding: 2.5rem;
}
.team-content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
}
.team-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
}
.team-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}
.team-card-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
}
.team-card-header span {
    font-size: 0.875rem;
    color: var(--text-secondary);
}
.permissions-list, .team-members-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
.team-members-list .team-member-item + .team-member-item {
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
}
.team-member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 8px;
    transition: background-color 0.2s;
    padding: 0.5rem;
    margin: -0.5rem; /* Counteract padding */
    cursor: pointer;
}
.team-member-item:hover {
    background-color: var(--subproject-card-bg);
}
.member-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.avatar-wrapper {
    position: relative;
    flex-shrink: 0;
}
.avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
}
.status-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--card-bg);
}
.status-indicator.online { background-color: var(--online); }
.status-indicator.offline { background-color: var(--offline); }

.member-details { display: flex; flex-direction: column; gap: 0.25rem; }
.member-name-role { display: flex; align-items: center; gap: 0.5rem; }
.member-name { font-weight: 600; }
.role-tag {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}
.member-email-wrapper {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--text-secondary);
}
.member-email { font-size: 0.875rem; }

.member-actions { display: flex; align-items: center; gap: 1rem; }
.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
}
.status-badge.status-online { background-color: #065F46; color: #A7F3D0; }
.status-badge.status-offline { background-color: #374151; color: #D1D5DB; }

.permission-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}
.permission-icon {
    flex-shrink: 0;
    margin-top: 2px;
}
.permission-details h3 {
    margin: 0 0 0.25rem;
    font-size: 1rem;
    font-weight: 600;
}
.permission-details p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
}


/* Team Member Profile View */
.team-member-profile-view {
    padding: 2.5rem;
}
.profile-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
}
.profile-header-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
}
.profile-avatar-container {
    position: relative;
    flex-shrink: 0;
}
.profile-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 3px solid var(--primary-end);
}
.avatar-upload-button {
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--subproject-card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
}
.avatar-upload-button:hover {
    background-color: var(--border-color);
}
.profile-info {
    display: flex;
    flex-direction: column;
}
.profile-name, .profile-role {
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    margin: 0 -0.5rem;
    border-radius: 6px;
    transition: background-color 0.2s;
}
.profile-name:hover, .profile-role:hover {
    background-color: var(--subproject-card-bg);
}
.profile-name {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}
.profile-role {
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 500;
    margin-bottom: 0.5rem;
}
.profile-name-input, .profile-role-input {
    background-color: var(--subproject-card-bg);
    border: 1px solid var(--primary-end);
    border-radius: 6px;
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    padding: 0.25rem 0.5rem;
    outline: none;
}
.profile-name-input {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}
.profile-role-input {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.profile-clients-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
}
.client-assignment-section {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
    gap: 2rem;
    padding-top: 1.5rem;
}
.client-assignment-section > div:nth-child(2) {
    background-color: var(--border-color); /* Separator */
}
.assigned-clients-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.assigned-client-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background-color: var(--subproject-card-bg);
    border-radius: 6px;
}
.assigned-client-logo {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: contain;
    background-color: white;
}
.available-clients-list h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
}
.client-checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}
.client-checkbox-item input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--primary-end);
    cursor: pointer;
}
.client-checkbox-item label {
    cursor: pointer;
    color: var(--text-primary);
}


/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal-content {
  background-color: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  max-width: 80vw;
  max-height: 80vh;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  color: var(--text-primary);
}
.modal-content img {
  max-width: 100%;
  max-height: 70vh;
  display: block;
  border-radius: 8px;
}
.modal-close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary);
  cursor: pointer;
  line-height: 1;
}
.modal-close-button:hover {
    color: var(--text-primary);
}
.non-image-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}
.non-image-preview svg { margin-bottom: 1rem; }

/* Create Project Modal Styles */
.create-project-modal {
    background-color: #242424;
    padding: 2rem;
    border-radius: 12px;
    width: 100%;
    max-width: 450px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
}
.create-project-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}
.create-project-modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
}
.gradient-text {
    background: -webkit-linear-gradient(left, var(--primary-start), var(--primary-end));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.form-group { margin-bottom: 1.25rem; }
.form-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    font-weight: 500;
}
.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    background-color: #374151;
    border: 1px solid #6B7280;
    border-radius: 6px;
    padding: 0.75rem;
    color: var(--text-primary);
    font-size: 1rem;
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
}
.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--primary-end);
    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.3);
}
.form-group input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    cursor: pointer;
}
.status-radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
.radio-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s ease;
}
.radio-option:hover {
    background-color: var(--subproject-card-bg);
}
.radio-option input[type="radio"] {
    accent-color: var(--primary-end);
    width: 16px;
    height: 16px;
    cursor: pointer;
}
.radio-option label {
    margin: 0;
    font-weight: 400;
    color: var(--text-primary);
    cursor: pointer;
}
.form-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}
.button-secondary {
    background-color: #4B5563;
    color: var(--text-primary);
    border: 1px solid #6B7280;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.button-secondary:hover { background-color: #6B7280; }
.button-primary {
    background: linear-gradient(to right, var(--primary-end), var(--primary-start));
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
.button-primary:hover { box-shadow: 0 0 15px rgba(52, 211, 153, 0.5); }
.button-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
}

/* --- Responsive Styles --- */
.hamburger-menu {
    display: none;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.5rem;
    margin-left: -0.5rem;
}
.header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    z-index: 1999;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
}
.sidebar-overlay.visible {
    opacity: 1;
    visibility: visible;
}

@media (max-width: 1200px) {
    .project-detail-content {
        grid-template-columns: 1fr 1fr;
    }
    .key-visual-panel, .subprojects-panel {
        grid-column: span 1;
    }
    .comments-panel {
        grid-column: 1 / -1;
    }
    .team-content-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 992px) { /* Tablet Portrait */
    .project-detail-content {
        grid-template-columns: 1fr;
    }
    .key-visual-panel, .subprojects-panel, .comments-panel {
        grid-column: 1 / -1;
    }
    .client-assignment-section {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    .client-assignment-section > div:nth-child(2) {
        display: none;
    }
    .profile-header-card {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    .client-info-bar {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
    }
    .team-member-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    .team-member-item .member-actions {
        width: 100%;
        justify-content: space-between;
    }
}

@media (max-width: 768px) { /* Mobile */
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        z-index: 2000;
        transform: translateX(-100%);
        transition: transform 0.3s ease-in-out;
        box-shadow: 5px 0 15px rgba(0,0,0,0.2);
    }
    .sidebar.open {
        transform: translateX(0);
    }
    
    .hamburger-menu {
        display: block;
    }
    .logo-section h3, .user-section .user-name {
        display: none;
    }
    .app-header {
        padding: 0 1rem;
    }
    
    .projects-feed-view, .cases-view, .clients-view, .team-view, .project-detail-view, .client-detail-view, .team-member-profile-view {
        padding: 1.5rem;
    }
    .view-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    .view-header h1 {
        font-size: 1.75rem;
    }
    .view-header .button-primary {
        width: 100%;
        justify-content: center;
    }
    .panel-header {
        gap: 1rem;
    }
    .panel-header h4 {
        font-size: 1.25rem;
    }
    
    .project-grid, .client-grid, .cases-grid {
        grid-template-columns: 1fr;
    }
    
    .file-list-item {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    .file-list-item .file-actions {
        justify-content: flex-start;
    }
    .file-list-item .file-meta {
        flex-direction: column;
        gap: 0.5rem;
    }

    .auth-modal,
    .create-project-modal {
        width: calc(100% - 2rem);
        height: auto;
        max-height: 90vh;
        overflow-y: auto;
        padding: 1.5rem;
    }
    .form-actions {
        flex-direction: column-reverse;
        width: 100%;
        gap: 0.75rem;
    }
    .form-actions > * {
        width: 100%;
        justify-content: center;
    }
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const root = createRoot(document.getElementById('root'));
root.render(<App />);