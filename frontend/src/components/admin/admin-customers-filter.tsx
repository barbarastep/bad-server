import { useActionCreators, useDispatch, useSelector } from '@store/hooks'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    customersActions,
    customersSelector,
} from '../../services/slice/customers'
import { fetchCustomersWithFilters } from '../../services/slice/customers/thunk'
import { AppRoute } from '../../utils/constants'
import { FiltersCustomers } from '../../services/slice/customers/type'
import Filter from '../filter'
import { FilterValue } from '../filter/helpers/types'
import styles from './admin.module.scss'
import { customersFilterFields } from './helpers/customersFilterFields'

export default function AdminFilterCustomers() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [_, setSearchParams] = useSearchParams()
    const { updateFilter, clearFilters } = useActionCreators(customersActions)
    const filterCustomersOption = useSelector(
        customersSelector.selectFilterOption
    )

    const handleFilter = (filters: Record<string, FilterValue>) => {
        const normalizedFilters = Object.entries(filters).reduce<
            Partial<FiltersCustomers>
        >((acc, [key, value]) => {
            if (typeof value === 'object' && value) {
                acc[key as keyof FiltersCustomers] = value.value as never
            } else if (typeof value !== 'undefined') {
                acc[key as keyof FiltersCustomers] = value as never
            }

            return acc
        }, {})

        dispatch(updateFilter(normalizedFilters))
        const queryParams: { [key: string]: string } = {}
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                queryParams[key] =
                    typeof value === 'object'
                        ? value.value.toString()
                        : value.toString()
            }
        })
        setSearchParams(queryParams)
        navigate(
            `${AppRoute.AdminCustomers}?${new URLSearchParams(
                queryParams
            ).toString()}`
        )
    }

    const handleClearFilters = () => {
        dispatch(clearFilters())
        setSearchParams({})
        dispatch(fetchCustomersWithFilters({}))
        navigate(AppRoute.AdminCustomers)
    }

    return (
        <>
            <h2 className={styles.admin__title}>Фильтры</h2>
            <Filter
                fields={customersFilterFields}
                onFilter={handleFilter}
                defaultValue={filterCustomersOption}
                onClear={handleClearFilters}
            />
        </>
    )
}
