import { NextFunction, Request, Response } from 'express'
import { FilterQuery } from 'mongoose'
import NotFoundError from '../errors/not-found-error'
import Order from '../models/order'
import User, { IUser } from '../models/user'
import { getDateQueryValue, getNumberQueryValue, getSafeSearchRegex, getSingleQueryValue } from '../utils/request'

function getCustomerSearchQueryValue(value: unknown) {
    if (typeof value === 'string') {
        const trimmedValue = value.trim()

        return trimmedValue.length ? trimmedValue : undefined
    }

    if (Array.isArray(value)) {
        const joinedValue = value
            .filter((item): item is string => typeof item === 'string')
            .join(' ')
            .trim()

        return joinedValue.length ? joinedValue : undefined
    }

    return undefined
}

// TODO: Добавить guard admin
// eslint-disable-next-line max-len
// Get GET /customers?page=2&limit=5&sort=totalAmount&order=desc&registrationDateFrom=2023-01-01&registrationDateTo=2023-12-31&lastOrderDateFrom=2023-01-01&lastOrderDateTo=2023-12-31&totalAmountFrom=100&totalAmountTo=1000&orderCountFrom=1&orderCountTo=10
export const getCustomers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = getNumberQueryValue(req.query.page, 1, {
            min: 1,
            max: 1000,
        })
        const limit = getNumberQueryValue(req.query.limit, 10, {
            min: 1,
            max: 10,
        })
        const sortField =
            getSingleQueryValue(req.query.sortField) || 'createdAt'
        const sortOrder =
            getSingleQueryValue(req.query.sortOrder) === 'asc' ? 'asc' : 'desc'
        const registrationDateFrom = getDateQueryValue(
            req.query.registrationDateFrom
        )
        const registrationDateTo = getDateQueryValue(req.query.registrationDateTo)
        const lastOrderDateFrom = getDateQueryValue(req.query.lastOrderDateFrom)
        const lastOrderDateTo = getDateQueryValue(req.query.lastOrderDateTo)
        const totalAmountFrom = getSingleQueryValue(req.query.totalAmountFrom)
        const totalAmountTo = getSingleQueryValue(req.query.totalAmountTo)
        const orderCountFrom = getSingleQueryValue(req.query.orderCountFrom)
        const orderCountTo = getSingleQueryValue(req.query.orderCountTo)
        const search = getCustomerSearchQueryValue(req.query.search)

        const filters: FilterQuery<Partial<IUser>> = {}

        if (registrationDateFrom) {
            filters.createdAt = {
                ...filters.createdAt,
                $gte: registrationDateFrom,
            }
        }

        if (registrationDateTo) {
            const endOfDay = new Date(registrationDateTo)
            endOfDay.setHours(23, 59, 59, 999)
            filters.createdAt = {
                ...filters.createdAt,
                $lte: endOfDay,
            }
        }

        if (lastOrderDateFrom) {
            filters.lastOrderDate = {
                ...filters.lastOrderDate,
                $gte: lastOrderDateFrom,
            }
        }

        if (lastOrderDateTo) {
            const endOfDay = new Date(lastOrderDateTo)
            endOfDay.setHours(23, 59, 59, 999)
            filters.lastOrderDate = {
                ...filters.lastOrderDate,
                $lte: endOfDay,
            }
        }

        if (totalAmountFrom) {
            filters.totalAmount = {
                ...filters.totalAmount,
                $gte: Number(totalAmountFrom),
            }
        }

        if (totalAmountTo) {
            filters.totalAmount = {
                ...filters.totalAmount,
                $lte: Number(totalAmountTo),
            }
        }

        if (orderCountFrom) {
            filters.orderCount = {
                ...filters.orderCount,
                $gte: Number(orderCountFrom),
            }
        }

        if (orderCountTo) {
            filters.orderCount = {
                ...filters.orderCount,
                $lte: Number(orderCountTo),
            }
        }

        if (search) {
            const searchRegex = getSafeSearchRegex(search)

            if (searchRegex) {
                const orders = await Order.find(
                    {
                        $or: [{ deliveryAddress: searchRegex }],
                    },
                    '_id'
                )

                const orderIds = orders.map((order) => order._id)

                filters.$or = [
                    { name: searchRegex },
                    { lastOrder: { $in: orderIds } },
                ]
            }
        }

        const sort: { [key: string]: any } = {}
        const allowedSortFields = new Set([
            'createdAt',
            'lastOrderDate',
            'totalAmount',
            'orderCount',
            'name',
        ])

        if (allowedSortFields.has(sortField)) {
            sort[sortField] = sortOrder === 'desc' ? -1 : 1
        } else {
            sort.createdAt = -1
        }

        const options = {
            sort,
            skip: (page - 1) * limit,
            limit,
        }

        const users = await User.find(filters, null, options).populate([
            'orders',
            {
                path: 'lastOrder',
                populate: {
                    path: 'products',
                },
            },
            {
                path: 'lastOrder',
                populate: {
                    path: 'customer',
                },
            },
        ])

        const totalUsers = await User.countDocuments(filters)
        const totalPages = Math.ceil(totalUsers / Number(limit))

        res.status(200).json({
            customers: users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: page,
                pageSize: limit,
            },
        })
    } catch (error) {
        next(error)
    }
}

// TODO: Добавить guard admin
// Get /customers/:id
export const getCustomerById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.params.id).populate([
            'orders',
            'lastOrder',
        ])
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

// TODO: Добавить guard admin
// Patch /customers/:id
export const updateCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const allowedFields = ['name', 'email', 'phone', 'roles'] as const
    const payload = allowedFields.reduce<Record<string, unknown>>((acc, field) => {
        if (typeof req.body[field] !== 'undefined') {
            acc[field] = req.body[field]
        }

        return acc
    }, {})

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            payload,
            {
                new: true,
                runValidators: true,
            }
        )
            .orFail(
                () =>
                    new NotFoundError(
                        'Пользователь по заданному id отсутствует в базе'
                    )
            )
            .populate(['orders', 'lastOrder'])
        res.status(200).json(updatedUser)
    } catch (error) {
        next(error)
    }
}

// TODO: Добавить guard admin
// Delete /customers/:id
export const deleteCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id).orFail(
            () =>
                new NotFoundError(
                    'Пользователь по заданному id отсутствует в базе'
                )
        )
        res.status(200).json(deletedUser)
    } catch (error) {
        next(error)
    }
}
