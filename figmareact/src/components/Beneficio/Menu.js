import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import api from "../../api/api";
import AddEditModal from "./AddEditModal";
import styles from "./BeneficiosAssistente.module.css";
import DeleteModal from "./DeleteModal";
import HistoricoTable from "./HistoricoTable";
import Pagination from "./Pagination";

function HistoricoList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [categoriasData, setCategoriasData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const getCategorias = async () => {
    try {
      const response = await api.get("/categorias");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dados das categorias:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategorias();
        setCategoriasData(data);
      } catch (error) {
        console.error("Erro ao buscar dados das categorias:", error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (event) => setSearchTerm(event.target.value);

  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleShowEditModal = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => setShowEditModal(false);

  const handleShowDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const handleDelete = async () => {
    try {
      if (selectedItem) {
        await api.delete(`/categorias/${selectedItem.id}`);
        const data = await getCategorias();
        setCategoriasData(data);
        handleCloseDeleteModal();
      }
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      alert("Houve um erro ao excluir o item. Por favor, tente novamente.");
    }
  };

  // Filtragem
  const filteredData = categoriasData.filter((item) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      (item.nome && item.nome.toLowerCase().includes(searchValue)) ||
      (item.descricao && item.descricao.toLowerCase().includes(searchValue))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const processBeneficiarios = (beneficiarios) => {
    if (!Array.isArray(beneficiarios)) {
      console.error("Beneficiários inválidos:", beneficiarios);
      return [];
    }
    return beneficiarios.map((beneficiario) => ({ id: beneficiario.id }));
  };

  const handleSave = async (item) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Processa os beneficiários antes de enviar para a API
      const processedBeneficiarios = processBeneficiarios(item.beneficiarios);

      const dataToSend = {
        ...item,
        beneficiarios: processedBeneficiarios,
      };

      if (item.id) {
        // Para PUT
        await api.put(`/categorias/${item.id}`, dataToSend, { headers });
      } else {
        // Para POST
        await api.post("/categorias", dataToSend, { headers });
      }

      const data = await getCategorias();
      setCategoriasData(data);
      handleCloseAddModal();
      handleCloseEditModal();
    } catch (error) {
      console.error("Erro ao salvar Benefício:", error);
      alert("Houve um erro ao salvar os dados. Por favor, tente novamente.");
    }
  };

  return (
    <div className={styles.historicoContainer}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Pesquisar benefícios..."
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchInput}
        />
        <Button onClick={handleShowAddModal} className={styles.createButton}>
          Criar
        </Button>
      </div>

      <HistoricoTable
        data={currentItems}
        onEdit={handleShowEditModal}
        onDelete={handleShowDeleteModal}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onSelectPage={setCurrentPage}
      />

      <AddEditModal
        show={showAddModal || showEditModal}
        handleClose={showAddModal ? handleCloseAddModal : handleCloseEditModal}
        title={
          showAddModal ? "Adicionar Benefícios" : "Editar Benefício e Categoria"
        }
        item={selectedItem}
        onSave={handleSave}
      />

      <DeleteModal
        show={showDeleteModal}
        handleClose={handleCloseDeleteModal}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default HistoricoList;
