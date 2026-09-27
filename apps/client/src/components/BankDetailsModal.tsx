import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BankDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankName: string;
  bankLogo?: string;
  accountNumber?: string;
  accountName?: string;
  type: number;
}

export const BankDetailsModal = ({
  isOpen,
  onClose,
  bankName,
  bankLogo,
  accountNumber,
  accountName,
  type,
}: BankDetailsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          {/* Bank Logo */}
          <div className="flex justify-center mb-4">
            {bankLogo ? (
              <img
                src={bankLogo}
                alt={bankName}
                className="h-12 object-contain"
              />
            ) : (
              <DialogTitle className="text-lg font-bold text-primary">
                {bankName}
              </DialogTitle>
            )}
          </div>
        </DialogHeader>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-700">Tên ngân hàng</Label>
            <Input value={bankName} readOnly className="mt-1 bg-gray-50" />
          </div>

          {type === 2 ? (
            // Type 2 (OLD) - Card/Account Number
            <>
              <div>
                <Label className="text-sm text-gray-700">Số tài khoản</Label>
                <Input
                  value={accountNumber || ""}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-700">Số thẻ</Label>
                <Input placeholder="" readOnly className="mt-1 bg-gray-50" />
              </div>
              <div>
                <Label className="text-sm text-gray-700">Số CVV</Label>
                <Input placeholder="CVV" readOnly className="mt-1 bg-gray-50" />
              </div>
              <div>
                <Label className="text-sm text-gray-700">Ngày hết hạn</Label>
                <Input
                  placeholder="MM/YY"
                  readOnly
                  className="mt-1 bg-gray-50"
                />
              </div>
            </>
          ) : (
            // Type 1 (NEW) - E-Banking
            <>
              <div>
                <Label className="text-sm text-gray-700">Tên tài khoản</Label>
                <Input
                  value={accountName || ""}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-700">Mật khẩu</Label>
                <Input
                  type="password"
                  value="********"
                  readOnly
                  className="mt-1 bg-gray-50"
                />
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={onClose}
          className="w-full mt-6 bg-red-700 hover:bg-red-800 text-white font-bold"
        >
          Kê khai
        </Button>
      </DialogContent>
    </Dialog>
  );
};
