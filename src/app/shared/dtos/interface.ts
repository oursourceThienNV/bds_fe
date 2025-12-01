export interface KIPInterface {
  id,
  serviceId,
  serviceName,
  serviceCode,
  unit,
  status,
  havingChannel,
  isMain
}

export interface CatItem {
  id,
  itemCode,
  itemName,
  itemValue,
  categoryId,
  status
}

export interface KPILevel {
  id,
  userLevel,
  hasChannel,
  levelTargetView,
  levelName,
  configType,
  unit,
  orderNo,
  status,
  levelTargetId
}

export interface MachineItem {
  id,
  createdDate,
  updatedDate,
  code,
  name,
  original,
  status,
  note,
  createUser,
  updateUser
}
