import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import api from "../../api/api";

const AddEditModal = ({ show, handleClose, title, item, onSave }) => {
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    cpf: "",
    data: "",
    beneficiario: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [filteredBeneficiarios, setFilteredBeneficiarios] = useState([]);

  useEffect(() => {
    const fetchBeneficiarios = async () => {
      try {
        const response = await api.get("/Beneficiario");
        // Filtra beneficiários válidos (com username)
        const validBeneficiarios = response.data.filter(
          (b) => b.username && b.username.trim() !== ""
        );
        setBeneficiarios(validBeneficiarios);
      } catch (error) {
        console.error("Erro ao buscar beneficiários:", error);
        setBeneficiarios([]);
      }
    };

    fetchBeneficiarios();
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id || "",
        username: item.username || "",
        cpf: item.cpf || "",
        data: item.data || "",
        beneficiario: item.beneficiario || null,
      });
      setSearchTerm(item.beneficiario?.username || "");
    } else {
      setFormData({
        id: "",
        username: "",
        cpf: "",
        data: "",
        beneficiario: null,
      });
      setSearchTerm("");
    }
  }, [item]);

  useEffect(() => {
    if (isSearching && searchTerm) {
      const searchTermNormalized = searchTerm.toLowerCase().trim();

      const results = beneficiarios.filter((beneficiario) => {
        // Ignora beneficiários sem username ou com username vazio
        if (!beneficiario.username || beneficiario.username.trim() === "") {
          return false;
        }

        // Busca por nome
        const nameMatch = beneficiario.username
          .toLowerCase()
          .includes(searchTermNormalized);

        // Busca por CPF (se existir)
        const cpfMatch = beneficiario.cpf
          ? beneficiario.cpf
              .replace(/\D/g, "")
              .includes(searchTerm.replace(/\D/g, ""))
          : false;

        // Busca por NIS (se existir)
        const nisMatch = beneficiario.nis
          ? beneficiario.nis.includes(searchTerm)
          : false;

        return nameMatch || cpfMatch || nisMatch;
      });

      console.log("Termo de busca normalizado:", searchTermNormalized);
      console.log("Resultados filtrados:", results);
      setFilteredBeneficiarios(results);
    } else {
      setFilteredBeneficiarios([]);
    }
  }, [searchTerm, beneficiarios, isSearching]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBeneficiarioSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearching(true);

    if (!value) {
      setFormData((prev) => ({
        ...prev,
        beneficiario: null,
      }));
    }
  };

  const handleBeneficiarioSelect = (beneficiario) => {
    setFormData((prev) => ({
      ...prev,
      beneficiario: {
        id: beneficiario.id,
      },
    }));
    setSearchTerm(beneficiario.username);
    setIsSearching(false);
  };

  const formatCPF = (cpf) => {
    if (!cpf) return "";
    const numbers = cpf.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const isValidCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, ""); // Remove caracteres não numéricos
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0,
      resto;

    // Validação do primeiro dígito verificador
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;

    // Validação do segundo dígito verificador
    for (let i = 1; i <= 10; i++)
      soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  const handleSubmit = () => {
    // Verifica os campos obrigatórios individualmente
    if (!formData.username) {
      alert("Por favor, preencha o campo de nome de usuário.");
      return;
    }

    if (!formData.cpf) {
      alert("Por favor, preencha o campo de CPF.");
      return;
    }

    if (!isValidCPF(formData.cpf)) {
      alert(
        "CPF inválido ou já cadastrado. Por favor, insira um número de CPF válido."
      );
      return;
    }

    if (!formData.data) {
      alert("Por favor, preencha a data.");
      return;
    }

    // Validação de data: A data de nascimento não pode ser igual ou posterior ao dia de hoje
    const dataNascimento = new Date(formData.data);
    const dataHoje = new Date();
    dataHoje.setHours(0, 0, 0, 0); // Zera a hora, minuto, segundo e milissegundo de hoje

    if (dataNascimento >= dataHoje) {
      alert("A data de nascimento deve ser válida.");
      return;
    }

    if (!formData.beneficiario) {
      alert("Por favor, selecione um beneficiário.");
      return;
    }

    // Continuação do envio do formulário
    alert("Filiado criado com sucesso!");

    // Cria o objeto de dados a ser enviado
    const submissionData = {
      id: formData.id, // Mantém o ID do filiado para a edição
      username: formData.username,
      cpf: formData.cpf, // Remove formatação do CPF
      data: formData.data,
      beneficiario: { id: formData.beneficiario.id }, // Apenas o ID do beneficiário
    };

    // Log para depuração
    console.log("Dados sendo enviados:", submissionData);

    // Chama a função onSave passando os dados do formulário
    onSave(submissionData);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Nome do Filiado*</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formCpf">
            <Form.Label>CPF*</Form.Label>
            <Form.Control
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formData">
            <Form.Label>Data de Nascimento*</Form.Label>
            <Form.Control
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBeneficiario">
            <Form.Label>Beneficiário*</Form.Label>
            <div className="position-relative">
              <Form.Control
                type="text"
                value={searchTerm}
                onChange={handleBeneficiarioSearchChange}
                onFocus={() => setIsSearching(true)}
                placeholder="Pesquise por CPF ou NIS"
                required
              />
              {isSearching && filteredBeneficiarios.length > 0 && (
                <div
                  className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                  }}
                >
                  {filteredBeneficiarios.map((beneficiario) => (
                    <div
                      key={beneficiario.id}
                      className="p-2 border-bottom hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleBeneficiarioSelect(beneficiario)}
                    >
                      <div className="d-flex flex-column">
                        <span className="fw-bold">
                          {beneficiario.username || "Nome não informado"}
                        </span>
                        <span className="text-muted small">
                          {beneficiario.cpf &&
                            `CPF: ${formatCPF(beneficiario.cpf)}`}
                          {beneficiario.nis && ` | NIS: ${beneficiario.nis}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddEditModal;
