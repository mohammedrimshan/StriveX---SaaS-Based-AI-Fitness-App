"use client";

import React, { useState } from "react";
import { IClient } from "@/types/User";
import ClientDetailModal from "./ClientDetailModal";
import ClientCard from "./ClientCard";
import { motion } from "framer-motion";

interface ClientGridProps {
  clients: IClient[];
}

const ClientGrid: React.FC<ClientGridProps> = ({ clients }) => {
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openClientModal = (client: IClient) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const closeClientModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedClient(null), 300);
  };

  return (
    <div>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {clients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ClientCard client={client} onClick={() => openClientModal(client)} />
          </motion.div>
        ))}
      </motion.div>

      <ClientDetailModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={closeClientModal}
      />
    </div>
  );
};

export default ClientGrid;
