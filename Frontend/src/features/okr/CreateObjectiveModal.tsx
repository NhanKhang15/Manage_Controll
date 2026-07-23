import { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { departments } from "../../mocks/okr";
import type { Objective } from "../../types/okr";

export interface CreateObjectiveModalProps {
  isOpen: boolean;
  period: string;
  onClose: () => void;
  onCreate: (objective: Objective) => void;
}

export function CreateObjectiveModal({ isOpen, period, onClose, onCreate }: CreateObjectiveModalProps) {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState(departments[0]);
  const [owner, setOwner] = useState("");

  function handleSubmit() {
    if (!title.trim()) return;
    onCreate({
      id: `obj-${Date.now()}`,
      title: title.trim(),
      period,
      department,
      owner: owner.trim() || "Chưa gán",
      keyResults: [],
    });
    setTitle("");
    setOwner("");
    onClose();
  }

  return (
    <Modal isOpen={isOpen} title="✨ Mục tiêu mới" onClose={onClose}>
      <form className="settings-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <label>
          Objective
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Tăng trưởng doanh thu quý 3" />
        </label>
        <label>
          Phòng ban
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label>
          Người phụ trách
          <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Tên người phụ trách" />
        </label>
        <Button variant="primary" type="submit">
          ✨ Tạo mục tiêu
        </Button>
      </form>
    </Modal>
  );
}
