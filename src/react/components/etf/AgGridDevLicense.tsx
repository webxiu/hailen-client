import { useEffect } from 'react';
import { LicenseManager } from 'ag-grid-enterprise';

const AgGridDevLicense: React.FC = () => {
  useEffect(() => {
    // 仅在开发环境中设置评估许可证
    if (process.env.NODE_ENV === 'development') {
      LicenseManager.setLicenseKey(
        'For_Trialing_ag-Grid_Only-Not_For_Real_Development_Or_Production_Projects-Valid_Until-15_August_2024_[v2]_MTcwODA4NTIwMDAwMA==9aa5b7bf868ec5d39dc5cb979372325b',
      );
    }
  }, []);

  return null;
};

export default AgGridDevLicense;
