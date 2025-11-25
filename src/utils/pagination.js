/**
 * Utilitário para paginação, busca e ordenação
 */

/**
 * Processa query parameters para paginação
 */
function getPaginationParams(req, defaultLimit = 10) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Processa query parameters para busca
 */
function getSearchParams(req, searchableFields = []) {
  const search = req.query.search ? req.query.search.trim() : '';
  
  if (!search || searchableFields.length === 0) {
    return null;
  }

  return {
    search,
    fields: searchableFields
  };
}

/**
 * Processa query parameters para ordenação
 */
function getSortParams(req, defaultSort = { createdAt: 'desc' }, allowedFields = []) {
  const sortField = req.query.sort || Object.keys(defaultSort)[0];
  const sortOrder = req.query.order === 'asc' ? 'asc' : 'desc';

  // Valida se o campo de ordenação é permitido
  if (allowedFields.length > 0 && !allowedFields.includes(sortField)) {
    return defaultSort;
  }

  return { [sortField]: sortOrder };
}

/**
 * Cria objeto de paginação para a view
 */
function getPaginationInfo(page, limit, total) {
  // Proteção contra divisão por zero
  const safeLimit = limit > 0 ? limit : 10;
  const totalPages = total > 0 ? Math.ceil(total / safeLimit) : 1;
  const startItem = total > 0 ? (page - 1) * safeLimit + 1 : 0;
  const endItem = Math.min(page * safeLimit, total);
  
  return {
    currentPage: page,
    totalPages: totalPages || 1,
    totalItems: total,
    itemsPerPage: safeLimit,
    startItem,
    endItem,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
}

/**
 * Cria condições de busca para Prisma
 */
function buildSearchConditions(searchParams) {
  if (!searchParams || !searchParams.search) {
    return {};
  }

  const { search, fields } = searchParams;
  
  if (fields.length === 0) {
    return {};
  }

  // Para múltiplos campos, usa OR
  // MySQL não suporta mode: 'insensitive', então usamos contains sem mode
  if (fields.length === 1) {
    return {
      [fields[0]]: {
        contains: search
      }
    };
  }

  return {
    OR: fields.map(field => ({
      [field]: {
        contains: search
      }
    }))
  };
}

/**
 * Cria URL com query parameters preservados
 */
function buildQueryUrl(baseUrl, params) {
  const url = new URL(baseUrl, 'http://localhost');
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      url.searchParams.set(key, params[key]);
    }
  });
  
  return url.pathname + url.search;
}

module.exports = {
  getPaginationParams,
  getSearchParams,
  getSortParams,
  getPaginationInfo,
  buildSearchConditions,
  buildQueryUrl
};

