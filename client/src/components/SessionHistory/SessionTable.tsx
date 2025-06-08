import React from 'react';
import { motion } from 'framer-motion';
import { FaUsers } from 'react-icons/fa';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { SessionItem } from '@/types/Session';
import { UserRole } from '@/types/UserRole';
import SessionTableHeader from './SessionTableHeader';
import SessionTableRow from './SessionTableRow';
import EmptyState from './EmptyState';

interface SessionTableProps {
  filteredItems: SessionItem[];
  searchTerm: string;
  role: UserRole;
}

const SessionTable: React.FC<SessionTableProps> = ({ filteredItems, searchTerm, role }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <Card className="shadow-xl bg-white border-gray-200 rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <FaUsers className="text-2xl text-cyan-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Sessions ({filteredItems.length})
              </h2>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <SessionTableHeader role={role} />
                <TableBody>
                  {filteredItems.map((item, index) => (
                    <SessionTableRow
                      key={item.id || index}
                      item={item}
                      index={index}
                      role={role}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SessionTable;